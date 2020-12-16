import hash from 'hash-sum'
import path from 'path'
import qs from 'querystring'
import {
  parse,
  rewriteDefault,
  SFCBlock,
  SFCDescriptor,
} from '@vue/compiler-sfc'
import { Options } from '.'
import { getPrevDescriptor, setDescriptor } from './utils/descriptorCache'
import { PluginContext, TransformPluginContext } from 'rollup'
import { createRollupError } from './utils/error'
import { resolveScript } from './script'
import { transformTemplateInMain } from './template'
import { isOnlyTemplateChanged } from './handleHotUpdate'

export async function genSfcFacade(
  code: string,
  filename: string,
  options: Options,
  sourceRoot: string,
  isProduction: boolean,
  isServer: boolean,
  filterCustomBlock: (type: string) => boolean,
  pluginContext: TransformPluginContext
) {
  // prev descriptor is only set and used for hmr
  const prevDescriptor = getPrevDescriptor(filename)
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

  // script
  const { code: scriptCode, map } = await genScriptCode(
    descriptor,
    scopeId,
    isProduction,
    isServer,
    options,
    pluginContext
  )

  // template
  const useInlineTemplate =
    !options.hmr &&
    descriptor.scriptSetup &&
    !(descriptor.template && descriptor.template.src)
  const hasTemplateImport = descriptor.template && !useInlineTemplate

  const templateCode = hasTemplateImport
    ? genTemplateCode(descriptor, scopeId, options, isServer, pluginContext)
    : ''

  const renderReplace = hasTemplateImport
    ? isServer
      ? `_sfc_main.ssrRender = _sfc_ssrRender`
      : `_sfc_main.render = _sfc_render`
    : ''

  // styles
  const stylesCode = genStyleCode(
    descriptor,
    scopeId,
    options.preprocessStyles,
    options.vite
  )

  // custom blocks
  const customBlocksCode = getCustomBlock(descriptor, filterCustomBlock)

  const output: string[] = [
    scriptCode,
    templateCode,
    stylesCode,
    customBlocksCode,
    renderReplace,
  ]
  if (hasScoped) {
    output.push(`_sfc_main.__scopeId = ${JSON.stringify(`data-v-${scopeId}`)}`)
  }
  if (!isProduction) {
    output.push(`_sfc_main.__file = ${JSON.stringify(shortFilePath)}`)
  } else if (options.exposeFilename) {
    output.push(
      `_sfc_main.__file = ${JSON.stringify(path.basename(shortFilePath))}`
    )
  }
  output.push('export default _sfc_main')

  if (options.hmr) {
    // check if the template is the only thing that changed
    if (prevDescriptor && isOnlyTemplateChanged(prevDescriptor, descriptor)) {
      output.push(`export const _rerender_only = true`)
    }
    output.push(`_sfc_main.__hmrId = ${JSON.stringify(scopeId)}`)
    output.push(
      `__VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main)`
    )
    output.push(
      `import.meta.hot.accept(({ default: updated, _rerender_only }) => {`,
      `  if (_rerender_only) {`,
      `    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render)`,
      `  } else {`,
      `    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated)`,
      `  }`,
      `})`
    )
  }

  return {
    code: output.join('\n'),
    map: map || {
      mappings: '',
    },
  }
}

function genTemplateCode(
  descriptor: SFCDescriptor,
  id: string,
  options: Options,
  isServer: boolean,
  pluginContext: PluginContext
) {
  const renderFnName = isServer ? 'ssrRender' : 'render'
  const template = descriptor.template!

  if (!template.lang && !template.src) {
    return transformTemplateInMain(
      template.content,
      descriptor,
      id,
      options,
      pluginContext
    )
  } else {
    const src = template.src || descriptor.filename
    const idQuery = `&id=${id}`
    const srcQuery = template.src ? `&src` : ``
    const attrsQuery = attrsToQuery(template.attrs, 'js', true)
    const query = `?vue&type=template${idQuery}${srcQuery}${attrsQuery}`
    return `import { ${renderFnName} as _sfc_${renderFnName} } from ${JSON.stringify(
      src + query
    )}`
  }
}

async function genScriptCode(
  descriptor: SFCDescriptor,
  scopeId: string,
  isProd: boolean,
  isServer: boolean,
  options: Options,
  pluginContext: TransformPluginContext
) {
  let scriptCode = `const _sfc_main = {}`
  let map
  const script = resolveScript(
    descriptor,
    scopeId,
    isProd,
    isServer,
    options,
    pluginContext
  )
  if (script) {
    // js or ts can be directly placed in the main module
    if (
      (!script.lang ||
        (script.lang === 'ts' && (pluginContext as any).server)) &&
      !script.src
    ) {
      scriptCode = rewriteDefault(script.content, `_sfc_main`)
      map = script.map
      if (script.lang === 'ts') {
        const result = await (pluginContext as any).server.transformWithEsbuild(
          scriptCode,
          descriptor.filename,
          { loader: 'ts' },
          map
        )
        scriptCode = result.code
        map = result.map
      }
    } else {
      const src = script.src || descriptor.filename
      const attrsQuery = attrsToQuery(script.attrs, 'js')
      const srcQuery = script.src ? `&src` : ``
      const query = `?vue&type=script${srcQuery}${attrsQuery}`
      const scriptRequest = JSON.stringify(src + query)
      scriptCode =
        `import _sfc_main from ${scriptRequest}\n` +
        `export * from ${scriptRequest}` // support named exports
    }
  }
  return {
    code: scriptCode,
    map,
  }
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
          stylesCode += `\nconst cssModules = _sfc_main.__cssModules = {}`
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
      code += `if (typeof block${index} === 'function') block${index}(_sfc_main)\n`
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
