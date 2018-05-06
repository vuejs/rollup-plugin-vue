import {SFCDescriptor, SFCBlock, SFCCustomBlock} from '@vue/component-compiler-utils'
import {createFilter} from 'rollup-pluginutils'
import queryString from 'querystring'

const GET_QUERY = /\.vue(\.[a-z]+?)?\?(.+)$/i
const PARAM_NAME = 'rollup_plugin_vue'

export interface VuePartRequest {
  filename: string,
  meta: VuePartRequestMeta
}

export interface VuePartRequestMeta {
  type: 'template' | 'script' | 'styles' | 'customBlocks'
  lang: string
  index?: number
}

export interface VuePartRequestCreator {
  (filename: string, lang: string, type: string, index?: number): string

  defaultLang: {
    [key: string]: string
  }
}

export function createVueFilter(include: string | undefined, exclude: string | undefined): (file: string) => boolean {
  const filter = createFilter(include || '**/*.vue', exclude)

  return id => filter(id)
}

export function getVueMetaFromQuery(id: string): VuePartRequestMeta | null {
  const match = GET_QUERY.exec(id)

  if (match) {
    const query = queryString.parse(match[2])

    if (PARAM_NAME in query) {
      return JSON.parse(query[PARAM_NAME] as string)
    }
  }

  return null
}

export function isVuePartRequest(id: string): boolean {
  return getVueMetaFromQuery(id) !== null
}

export const createVuePartRequest: VuePartRequestCreator = ((filename: string, lang: string | undefined, type: string, index?: number): string => {
  lang = lang || createVuePartRequest.defaultLang[type]

  const query = {
    [PARAM_NAME]: JSON.stringify({type, index, lang})
  }

  return `${filename}.${lang}?${queryString.stringify(query)}`
}) as VuePartRequestCreator

createVuePartRequest.defaultLang = {
  template: 'html',
  styles: 'css',
  script: 'js'
}

export function parseVuePartRequest(id: string): VuePartRequest | undefined {
  if (!id.includes('.vue')) return

  const filename = id.substr(0, id.lastIndexOf('.vue') + 4)
  const params = getVueMetaFromQuery(id)

  if (params === null) return

  return {
    filename,
    meta: params
  }
}

export function resolveVuePart(descriptors: Map<string, SFCDescriptor>, {filename, meta}: VuePartRequest): SFCBlock | SFCCustomBlock {
  const descriptor = descriptors.get(filename)

  if (!descriptor) throw Error('File not processed yet, ' + filename)

  const blocks = descriptor[meta.type]
  const block = Array.isArray(blocks) ? blocks[meta.index as number] : blocks

  if (!block) throw Error(`Requested (type=${meta.type} & index=${meta.index}) block not found in ${filename}`)

  return block
}
