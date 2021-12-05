import { parse, SFCDescriptor, SFCBlock } from '@vue/component-compiler-utils'
import { PluginContext } from 'rollup'
import qs from 'querystring'
import { setDescriptor } from './utils/descriptorCache'
import { attrsToQuery } from './utils/query'
import { componentNormalizerPath } from './runtime/componentNormalizer'

const templateCompiler = require('vue-template-compiler')

const nonWhitespaceRE = /\S+/

// empty styles: with no `src` specified or only contains whitespaces
const isNotEmptyStyle = (style: SFCBlock) => style.src || nonWhitespaceRE.test(style.content)

export function transformSFC(filename: string, source: string, sourceRoot: string, scopeId: string, pluginContext: PluginContext) {
  const descriptor = parse({
    filename,
    source,
    compiler: templateCompiler,
    sourceRoot,
    needMap: true
  })

  setDescriptor(filename, descriptor)

  const hasScoped = descriptor.styles.some(s => s.scoped)
  const hasFunctional = descriptor.template && descriptor.template.attrs.functional

  // template
  const { code: templateImport, } = genTemplateCode(descriptor, filename, scopeId)

  // script
  const { code: scriptImport, map: scriptMap } = genScriptCode(descriptor, filename, scopeId)

  // style
  const { code: stylesCode } = genStyleCode(descriptor, filename, scopeId, pluginContext)

  let code = `
${templateImport}
${scriptImport}
${stylesCode}

/* normalize component */
import normalizer from '${componentNormalizerPath}'
var component = normalizer(
  script,
  render,
  staticRenderFns,
  ${hasFunctional ? `true` : `false`},
  ${/injectStyles/.test(stylesCode) ? `injectStyles` : `null`},
  ${hasScoped ? JSON.stringify(scopeId) : `null`},
  null,
  null
)
  `.trim() + '\n'

  code += genCustomBlocksCode(descriptor.customBlocks, filename)

  code += `\nexport default component.exports`
  return {
    code,
    map: scriptMap as any
  }
}

export function genTemplateCode(descriptor: SFCDescriptor, filename: string, id: string) {
  // template
  const { template } = descriptor

  if (!template) {
    return {
      code: `var render, staticRenderFns`
    }
  }

  const src = template.src || filename
  const idQuery = `&id=${id}`
  const srcQuery = template.src ? `&src` : ``
  const from = template.src ? `&from=${filename}` : ''
  const attrsQuery = attrsToQuery(template.attrs, 'js', true)
  const query = `?vue${from}&type=template${idQuery}${srcQuery}${attrsQuery}`
  const request = src + query
  return {
    code: `import { render, staticRenderFns } from ${JSON.stringify(
      request
    )}`,
    request,
  }
}

export function genScriptCode(descriptor: SFCDescriptor, filename: string, id: string) {
  const { script } = descriptor
  if (!script) {
    return {
      code: `var script = {}`
    }
  }

  const src = script.src || filename
  const idQuery = `&id=${id}`
  const srcQuery = script.src ? `&src` : ``
  const attrsQuery = attrsToQuery(script.attrs, script.lang ?? 'js')
  const from = script.src ? `&from=${filename}` : ''
  const query = `?vue&type=script${idQuery}${srcQuery}${from}${attrsQuery}`
  const request = JSON.stringify(src + query)

  return {
    code: `import script from ${request}\n` + `export * from ${request}\n`,
    request,
    map: script.map
  }
}

export function genStyleCode(descriptor: SFCDescriptor, filename: string, id: string, pluginContext: PluginContext) {
  let hasCSSModules = false
  let styleImportsCode = ''
  let styleInjectorCode = ''
  const cssModuleNames = new Map()

  const { styles } = descriptor
  if (!styles.length) {
    return {
      code: ''
    }
  }

  function genCSSModulesCode(style: SFCBlock, index: number) {
    hasCSSModules = true
    const moduleName = style.module === true ? '$style' : style.module

    if (cssModuleNames.has(moduleName)) {
      pluginContext.error(`CSS module name ${moduleName} is not unique!`)
    }
    cssModuleNames.set(moduleName, true)

    const name = JSON.stringify(moduleName)
    styleInjectorCode += `\nthis[${name}] = style${index}`
  }


  styles.forEach((style, i) => {
    if (isNotEmptyStyle(style)) {
      const src = style.src || filename
      const attrsQuery = attrsToQuery(style.attrs, 'css')
      const idQuery = `&id=${id}`
      const srcQuery = style.src ? `&src` : ``
      const from = style.src ? `&from=${filename}` : ''
      const query = `?vue&type=style&index=${i}${from}${idQuery}${srcQuery}${attrsQuery}`
      const request = JSON.stringify(src + query)
      if (style.module) {
        styleImportsCode += `\nimport style${i} from ${request}`
        genCSSModulesCode(style, i)
      } else {
        styleImportsCode += `\nimport ${request}`
      }
    }
  })

  if (!hasCSSModules) {
    return {
      code: styleImportsCode
    }
  }

  let code = `
${styleImportsCode}
${hasCSSModules ? `var cssModules = {}` : ``}

function injectStyles (context) {
  ${styleInjectorCode}
}
`.trim()

  return {
    code
  }
}

export function genCustomBlocksCode(
  blocks: SFCBlock[],
  filename: string,
) {
  if (!blocks.length) {
    return ''
  }

  return `\n/* custom blocks */\n` + blocks.map((block, i) => {
    const src = block.attrs.src || filename
    const attrsQuery = attrsToQuery(block.attrs, block.type)
    const issuerQuery = block.attrs.src ? `&issuerPath=${qs.escape(filename)}` : ''
    const query = `?vue&type=custom&index=${i}&blockType=${qs.escape(block.type)}${issuerQuery}${attrsQuery}`
    return (
      `import block${i} from ${JSON.stringify(src + query)}\n` +
      `if (typeof block${i} === 'function') block${i}(component)`
    )
  }).join(`\n`) + `\n`
}
