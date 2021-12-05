import { SFCDescriptor } from '@vue/component-compiler-utils'

const cache = new Map<string, SFCDescriptor>()

export function getDescriptor(id: string) {
  if (cache.has(id)) {
    return cache.get(id)!
  }

  throw new Error(`${id} is not parsed yet`)
}

export function setDescriptor(id: string, descriptor: SFCDescriptor) {
  cache.set(id, descriptor)
}
