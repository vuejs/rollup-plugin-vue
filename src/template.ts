import {
  compileTemplate,
  SFCDescriptor,
  SFCTemplateCompileOptions,
} from '@vue/compiler-sfc'
import { TransformPluginContext } from 'rollup'
import { Options } from '.'
import { getResolvedScript } from './script'
import { getDescriptor } from './utils/descriptorCache'
import { createRollupError } from './utils/error'
import { TemplateBlockQuery } from './utils/query'
import { normalizeSourceMap } from './utils/sourceMap'

export function transformTemplate(
  code: string,
  request: string,
  options: Options,
  query: TemplateBlockQuery,
  pluginContext: TransformPluginContext
) {
  const descriptor = getDescriptor(query.filename)
  const result = compileTemplate({
    ...getTemplateCompilerOptions(options, descriptor, query.id),
    id: query.id,
    source: code,
    filename: query.filename,
  })

  if (result.errors.length) {
    result.errors.forEach((error) =>
      pluginContext.error(
        typeof error === 'string'
          ? { id: query.filename, message: error }
          : createRollupError(query.filename, error)
      )
    )
    return null
  }

  if (result.tips.length) {
    result.tips.forEach((tip) =>
      pluginContext.warn({
        id: query.filename,
        message: tip,
      })
    )
  }

  let returnCode = result.code
  if (options.hmr) {
    returnCode += `\nimport.meta.hot.accept(({ render }) => {
      __VUE_HMR_RUNTIME__.rerender(${JSON.stringify(query.id)}, render)
    })`
  }

  return {
    code: returnCode,
    map: normalizeSourceMap(result.map!, request),
  }
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
