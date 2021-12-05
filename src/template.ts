import * as vueTemplateCompiler from 'vue-template-compiler'
import hash from 'hash-sum'
import { PluginContext } from 'rollup'
import { compileTemplate } from '@vue/component-compiler-utils'
import { getDescriptor } from './utils/descriptorCache'
import { VuePluginOptions } from './interface'

export function transformRequireToImport(code: string): string {
  const imports: { [key: string]: string } = {}
  let strImports = ''

  code = code.replace(
    /require\(("(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+')\)/g,
    (_, name): any => {
      if (!(name in imports)) {
        imports[name] = `__$_require_${hash(name)}__`
        strImports += 'import ' + imports[name] + ' from ' + name + '\n'
      }

      return imports[name]
    }
  )

  return strImports + code
}

export function transformTemplate(
  source: string,
  filename: string,
  options: VuePluginOptions,
  pluginContext: PluginContext
) {
  const descriptor = getDescriptor(filename)
  const { template } = descriptor

  if (!template) {
    return {
      code: ''
    }
  }

  const { code, tips, errors } = compileTemplate({
    source,
    filename,
    compiler: vueTemplateCompiler as any,
    isFunctional: !!template.attrs.functional,
    optimizeSSR: false,
    prettify: false,
    preprocessLang: template.lang,
    ...options.template,
    transformAssetUrls: options.template?.transformAssetUrls ?? true,
  })

  if (tips.length) {
    tips.forEach(tip => {
      pluginContext.warn(typeof tip === 'object' ? tip.msg : tip)
    })
  }

  if (errors.length) {
    errors.forEach(error => {
      pluginContext.error(error as any)
    })
  }

  return {
    code: transformRequireToImport(code) + `\nexport { render, staticRenderFns }\n`
  }
}
