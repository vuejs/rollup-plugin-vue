import { SFCDescriptor } from '@vue/compiler-sfc'

const cache = new Map<string, SFCDescriptor>()
const prevCache = new Map<string, SFCDescriptor | undefined>()

export function setDescriptor(id: string, entry: SFCDescriptor) {
  cache.set(id, entry)
}

export function getPrevDescriptor(id: string) {
  return prevCache.get(id)
}

export function setPrevDescriptor(id: string, entry: SFCDescriptor) {
  prevCache.set(id, entry)
}

export function getDescriptor(id: string) {
  if (cache.has(id)) {
    return cache.get(id)!
  }
  throw new Error(`${id} is not parsed yet`)
}
