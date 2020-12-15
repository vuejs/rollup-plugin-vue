import hash from 'hash-sum'
import path from 'path'
import qs from 'querystring'
import { parse, SFCBlock, SFCDescriptor } from '@vue/compiler-sfc'
import { Options } from '.'
import { setDescriptor } from './utils/descriptorCache'
import { TransformPluginContext } from 'rollup'
import { createRollupError } from './utils/error'
import { resolveScript } from './script'

export function transformSFCEntry(
  code: string,
  filename: string,
  options: Options,
  sourceRoot: string,
  isProduction: boolean,
  isServer: boolean,
  filterCustomBlock: (type: string) => boolean,
  pluginContext: TransformPluginContext
) {
  const { descriptor, errors } = parse(code, {
    sourceMap: true,
    filename,
    sourceRoot,
  })
  setDescriptor(filename, descriptor)

  if (errors.length) {
    errors.forEach((error) =>
      pluginContext.error(createRollupError(filename, error))
    )
    return null
  }

  const shortFilePath = path
    .relative(sourceRoot, filename)
    .replace(/^(\.\.[\/\\])+/, '')
    .replace(/\\/g, '/')
  const scopeId = hash(
    isProduction ? shortFilePath + '\n' + code : shortFilePath
  )
  // feature information
  const hasScoped = descriptor.styles.some((s) => s.scoped)

  const useInlineTemplate =
    !options.hmr &&
    descriptor.scriptSetup &&
    !(descriptor.template && descriptor.template.src)
  const hasTemplateImport = descriptor.template && !useInlineTemplate

  const templateImport = hasTemplateImport
    ? genTemplateCode(descriptor, scopeId, isServer)
    : ''

  const renderReplace = hasTemplateImport
    ? isServer
      ? `script.ssrRender = ssrRender`
      : `script.render = render`
    : ''

  const scriptImport = genScriptCode(
    descriptor,
    scopeId,
    isProduction,
    isServer,
    options,
    pluginContext
  )
  const stylesCode = genStyleCode(
    descriptor,
    scopeId,
    options.preprocessStyles,
    options.vite
  )
  const customBlocksCode = getCustomBlock(descriptor, filterCustomBlock)
  const output = [
    scriptImport,
    templateImport,
    stylesCode,
    customBlocksCode,
    renderReplace,
  ]
  if (hasScoped) {
    output.push(`script.__scopeId = ${JSON.stringify(`data-v-${scopeId}`)}`)
  }
  if (!isProduction) {
    output.push(`script.__file = ${JSON.stringify(shortFilePath)}`)
  } else if (options.exposeFilename) {
    output.push(
      `script.__file = ${JSON.stringify(path.basename(shortFilePath))}`
    )
  }
  output.push('export default script')

  if (options.hmr) {
    output.push(`script.__hmrId = ${JSON.stringify(scopeId)}`)
    output.push(`__VUE_HMR_RUNTIME__.createRecord(script.__hmrId, script)`)
    output.push(
      `import.meta.hot.accept(({ default: script }) => {
  __VUE_HMR_RUNTIME__.reload(script.__hmrId, script)
})`
    )
  }

  return {
    code: output.join('\n'),
    map: {
      mappings: '',
    },
  }
}

function genTemplateCode(
  descriptor: SFCDescriptor,
  id: string,
  isServer: boolean
) {
  const renderFnName = isServer ? 'ssrRender' : 'render'
  let templateImport = `const ${renderFnName} = () => {}`
  let templateRequest
  if (descriptor.template) {
    const src = descriptor.template.src || descriptor.filename
    const idQuery = `&id=${id}`
    const srcQuery = descriptor.template.src ? `&src` : ``
    const attrsQuery = attrsToQuery(descriptor.template.attrs, 'js', true)
    const query = `?vue&type=template${idQuery}${srcQuery}${attrsQuery}`
    templateRequest = JSON.stringify(src + query)
    templateImport = `import { ${renderFnName} } from ${templateRequest}`
  }

  return templateImport
}

function genScriptCode(
  descriptor: SFCDescriptor,
  scopeId: string,
  isProd: boolean,
  isServer: boolean,
  options: Options,
  pluginContext: TransformPluginContext
) {
  let scriptImport = `const script = {}`
  const script = resolveScript(
    descriptor,
    scopeId,
    isProd,
    isServer,
    options,
    pluginContext
  )
  if (script) {
    const src = script.src || descriptor.filename
    const attrsQuery = attrsToQuery(script.attrs, 'js')
    const srcQuery = script.src ? `&src` : ``
    const query = `?vue&type=script${srcQuery}${attrsQuery}`
    const scriptRequest = JSON.stringify(src + query)
    scriptImport =
      `import script from ${scriptRequest}\n` + `export * from ${scriptRequest}` // support named exports
  }
  return scriptImport
}

function genStyleCode(
  descriptor: SFCDescriptor,
  scopeId: string,
  preprocessStyles?: boolean,
  isVite?: boolean
) {
  let stylesCode = ``
  let hasCSSModules = false
  if (descriptor.styles.length) {
    descriptor.styles.forEach((style, i) => {
      const src = style.src || descriptor.filename
      // do not include module in default query, since we use it to indicate
      // that the module needs to export the modules json
      const attrsQuery = attrsToQuery(style.attrs, 'css', preprocessStyles)
      const attrsQueryWithoutModule = attrsQuery.replace(
        /&module(=true|=[^&]+)?/,
        ''
      )
      // make sure to only pass id when necessary so that we don't inject
      // duplicate tags when multiple components import the same css file
      const idQuery = `&id=${scopeId}`
      const srcQuery = style.src ? `&src` : ``
      const query = `?vue&type=style&index=${i}${srcQuery}${idQuery}`
      const styleRequest = src + query + attrsQuery
      const styleRequestWithoutModule = src + query + attrsQueryWithoutModule
      if (style.module) {
        if (!hasCSSModules) {
          stylesCode += `\nconst cssModules = script.__cssModules = {}`
          hasCSSModules = true
        }
        stylesCode += genCSSModulesCode(
          i,
          styleRequest,
          styleRequestWithoutModule,
          style.module,
          isVite
        )
      } else {
        stylesCode += `\nimport ${JSON.stringify(styleRequest)}`
      }
      // TODO SSR critical CSS collection
    })
  }
  return stylesCode
}

function getCustomBlock(
  descriptor: SFCDescriptor,
  filter: (type: string) => boolean
) {
  let code = ''

  descriptor.customBlocks.forEach((block, index) => {
    if (filter(block.type)) {
      const src = block.src || descriptor.filename
      const attrsQuery = attrsToQuery(block.attrs, block.type)
      const srcQuery = block.src ? `&src` : ``
      const query = `?vue&type=${block.type}&index=${index}${srcQuery}${attrsQuery}`
      const request = JSON.stringify(src + query)
      code += `import block${index} from ${request}\n`
      code += `if (typeof block${index} === 'function') block${index}(script)\n`
    }
  })

  return code
}

function genCSSModulesCode(
  index: number,
  request: string,
  requestWithoutModule: string,
  moduleName: string | boolean,
  isVite?: boolean
): string {
  const styleVar = `style${index}`
  let code
  if (!isVite) {
    code =
      // first import the CSS for extraction
      `\nimport ${JSON.stringify(requestWithoutModule)}` +
      // then import the json file to expose to component...
      `\nimport ${styleVar} from ${JSON.stringify(request + '.js')}`
  } else {
    // vite handles module.ext in a single import
    request = request.replace(/\.(\w+)$/, '.module.$1.js')
    code = `\n import ${styleVar} from ${JSON.stringify(request)}`
  }

  // inject variable
  const name = typeof moduleName === 'string' ? moduleName : '$style'
  code += `\ncssModules["${name}"] = ${styleVar}`
  return code
}

// these are built-in query parameters so should be ignored
// if the user happen to add them as attrs
const ignoreList = ['id', 'index', 'src', 'type', 'lang']

function attrsToQuery(
  attrs: SFCBlock['attrs'],
  langFallback?: string,
  forceLangFallback = false
): string {
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (!ignoreList.includes(name)) {
      query += `&${qs.escape(name)}${
        value ? `=${qs.escape(String(value))}` : ``
      }`
    }
  }
  if (langFallback || attrs.lang) {
    query +=
      `lang` in attrs
        ? forceLangFallback
          ? `&lang.${langFallback}`
          : `&lang.${attrs.lang}`
        : `&lang.${langFallback}`
  }
  return query
}
