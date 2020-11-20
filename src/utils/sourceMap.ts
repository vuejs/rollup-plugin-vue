import { SFCTemplateCompileResults } from '@vue/compiler-sfc'

export function normalizeSourceMap(
  map: SFCTemplateCompileResults['map'],
  request: string
): any {
  if (!map) return null as any

  if (!request.includes('type=script')) {
    map.file = request
    map.sources[0] = request
  }

  return {
    ...map,
    version: Number(map.version),
    mappings: typeof map.mappings === 'string' ? map.mappings : '',
  }
}
