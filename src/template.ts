import {
  compileTemplate as compile,
  SFCDescriptor,
  SFCTemplateCompileOptions,
} from '@vue/compiler-sfc'
import { PluginContext, TransformPluginContext } from 'rollup'
import { Options } from '.'
import { getResolvedScript } from './script'
import { getDescriptor } from './utils/descriptorCache'
import { createRollupError } from './utils/error'
import { TemplateBlockQuery } from './utils/query'

export function transformTemplateAsModule(
  code: string,
  options: Options,
  query: TemplateBlockQuery,
  pluginContext: TransformPluginContext
) {
  const descriptor = getDescriptor(query.filename)

  const result = compileTemplate(
    code,
    descriptor,
    query.id,
    options,
    pluginContext
  )

  let returnCode = result.code
  if (options.hmr) {
    returnCode += `\nimport.meta.hot.accept(({ render }) => {
      __VUE_HMR_RUNTIME__.rerender(${JSON.stringify(query.id)}, render)
    })`
  }

  return {
    code: returnCode,
    map: result.map as any,
  }
}

/**
 * transform the template directly in the main SFC module
 */
export function transformTemplateInMain(
  code: string,
  descriptor: SFCDescriptor,
  id: string,
  options: Options,
  pluginContext: PluginContext
) {
  const result = compileTemplate(code, descriptor, id, options, pluginContext)
  return {
    ...result,
    code: result.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      '\n$1 _sfc_$2'
    ),
  }
}

export function compileTemplate(
  code: string,
  descriptor: SFCDescriptor,
  id: string,
  options: Options,
  pluginContext: PluginContext
) {
  const filename = descriptor.filename
  const compileOptions = getTemplateCompilerOptions(options, descriptor, id)
  const result = compile({
    ...compileOptions,
    id,
    source: code,
    filename,
  })

  if (result.errors.length) {
    result.errors.forEach((error) =>
      pluginContext.error(
        typeof error === 'string'
          ? { id: filename, message: error }
          : createRollupError(filename, error)
      )
    )
  }

  if (result.tips.length) {
    result.tips.forEach((tip) =>
      pluginContext.warn({
        id: filename,
        message: tip,
      })
    )
  }

  return result
}

export function getTemplateCompilerOptions(
  options: Options,
  descriptor: SFCDescriptor,
  scopeId: string
): Omit<SFCTemplateCompileOptions, 'source'> | undefined {
  const block = descriptor.template
  if (!block) {
    return
  }

  const isProd =
    process.env.NODE_ENV === 'production' || process.env.BUILD === 'production'
  const isServer = options.target === 'node'
  const hasScoped = descriptor.styles.some((s) => s.scoped)
  const preprocessLang = block.lang
  const preprocessOptions =
    preprocessLang &&
    options.templatePreprocessOptions &&
    options.templatePreprocessOptions[preprocessLang]
  const resolvedScript = getResolvedScript(descriptor, isServer)
  return {
    id: scopeId,
    scoped: hasScoped,
    isProd,
    filename: descriptor.filename,
    inMap: block.src ? undefined : block.map,
    preprocessLang,
    preprocessOptions,
    preprocessCustomRequire: options.preprocessCustomRequire,
    compiler: options.compiler,
    ssr: isServer,
    ssrCssVars: descriptor.cssVars,
    compilerOptions: {
      ...options.compilerOptions,
      scopeId: hasScoped ? `data-v-${scopeId}` : undefined,
      bindingMetadata: resolvedScript ? resolvedScript.bindings : undefined,
    },
    transformAssetUrls: options.transformAssetUrls,
  }
}
