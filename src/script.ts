import { compileScript, SFCDescriptor, SFCScriptBlock } from '@vue/compiler-sfc'
import { Options } from '.'
import { getTemplateCompilerOptions } from './template'

// since we generate different output based on whether the template is inlined
// or not, we need to cache the results separately
const inlinedCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()
const normalCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()

export function getResolvedScript(
  descriptor: SFCDescriptor,
  isServer: boolean
): SFCScriptBlock | null | undefined {
  const cacheToUse = isServer ? normalCache : inlinedCache
  return cacheToUse.get(descriptor)
}

export function resolveScript(
  descriptor: SFCDescriptor,
  scopeId: string,
  isProd: boolean,
  isServer: boolean,
  options: Options
) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null
  }

  const cached = getResolvedScript(descriptor, isServer)
  if (cached) {
    return cached
  }

  let resolved: SFCScriptBlock | null

  if (compileScript) {
    resolved = compileScript(descriptor, {
      id: scopeId,
      isProd,
      inlineTemplate: !isServer,
      templateOptions: getTemplateCompilerOptions(options, descriptor, scopeId),
    })
  } else if (descriptor.scriptSetup) {
    throw new Error(
      `<script setup> is not supported by the installed version of ` +
        `@vue/compiler-sfc - please upgrade.`
    )
  } else {
    resolved = descriptor.script
  }

  if (isServer) {
    normalCache.set(descriptor, resolved)
  } else {
    inlinedCache.set(descriptor, resolved)
  }

  return resolved
}
