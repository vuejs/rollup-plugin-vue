import qs from 'querystring'

export interface ScriptBlockQuery {
  filename: string
  vue: true
  type: 'script'
  src?: true
}

export interface TemplateBlockQuery {
  filename: string
  vue: true
  type: 'template'
  id: string
  src?: true
}

export interface StyleBlockQuery {
  filename: string
  vue: true
  type: 'style'
  index: number
  id: string
  scoped?: boolean
  module?: string | boolean
  src?: true
}

export interface CustomBlockQuery {
  filename: string
  vue: true
  type: 'custom'
  index: number
  src?: true
}

export interface NonVueQuery {
  filename: string
  vue: false
}

export type Query =
  | NonVueQuery
  | ScriptBlockQuery
  | TemplateBlockQuery
  | StyleBlockQuery
  | CustomBlockQuery

export function parseVuePartRequest(id: string): Query {
  const [filename, query] = id.split('?', 2)

  if (!query) return { vue: false, filename }

  const raw = qs.parse(query)

  if ('vue' in raw) {
    return {
      ...raw,
      filename,
      vue: true,
      index: Number(raw.index),
      src: 'src' in raw,
      scoped: 'scoped' in raw,
    } as any
  }

  return { vue: false, filename }
}
