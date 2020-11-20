import { compileScript, SFCDescriptor, SFCScriptBlock } from '@vue/compiler-sfc'
import { TransformPluginContext } from 'rollup'
import { Options } from '.'
import { getTemplateCompilerOptions } from './template'
import { createRollupError } from './utils/error'

// since we generate different output based on whether the template is inlined
// or not, we need to cache the results separately
const inlinedCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()
const normalCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()

export function getResolvedScript(
  descriptor: SFCDescriptor,
  enableInline: boolean
): SFCScriptBlock | null | undefined {
  const cacheToUse = enableInline ? inlinedCache : normalCache
  return cacheToUse.get(descriptor)
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

  const enableInline = !isServer
  const cacheToUse = enableInline ? inlinedCache : normalCache
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
        inlineTemplate: enableInline,
        templateOptions: enableInline
          ? getTemplateCompilerOptions(options, descriptor, scopeId)
          : undefined,
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
