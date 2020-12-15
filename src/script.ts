import { compileScript, SFCDescriptor, SFCScriptBlock } from '@vue/compiler-sfc'
import { TransformPluginContext } from 'rollup'
import { Options } from '.'
import { getTemplateCompilerOptions } from './template'
import { createRollupError } from './utils/error'

// ssr and non ssr builds would output different script content
const clientCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()
const serverCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()

export function getResolvedScript(
  descriptor: SFCDescriptor,
  isServer: boolean
): SFCScriptBlock | null | undefined {
  return (isServer ? serverCache : clientCache).get(descriptor)
}

export function resolveScript(
  descriptor: SFCDescriptor,
  scopeId: string,
  isProd: boolean,
  isServer: boolean,
  options: Options,
  pluginContext: TransformPluginContext
) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null
  }

  const cacheToUse = isServer ? serverCache : clientCache
  const cached = cacheToUse.get(descriptor)
  if (cached) {
    return cached
  }

  let resolved: SFCScriptBlock | null = null

  if (compileScript) {
    try {
      resolved = compileScript(descriptor, {
        id: scopeId,
        isProd,
        inlineTemplate: !options.hmr,
        templateOptions: getTemplateCompilerOptions(
          options,
          descriptor,
          scopeId
        ),
      })
    } catch (e) {
      pluginContext.error(createRollupError(descriptor.filename, e))
    }
  } else if (descriptor.scriptSetup) {
    pluginContext.error(
      `<script setup> is not supported by the installed version of ` +
        `@vue/compiler-sfc - please upgrade.`
    )
  } else {
    resolved = descriptor.script
  }

  cacheToUse.set(descriptor, resolved)
  return resolved
}
