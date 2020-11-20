import { SFCTemplateCompileResults } from '@vue/compiler-sfc'

export function normalizeSourceMap(
  map: SFCTemplateCompileResults['map'],
  id: string
): any {
  if (!map) return null as any

  if (!id.includes('type=script')) {
    map.file = id
    map.sources[0] = id
  }

  return {
    ...map,
    version: Number(map.version),
    mappings: typeof map.mappings === 'string' ? map.mappings : '',
  }
}
