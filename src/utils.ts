import {
  SFCDescriptor,
  SFCBlock,
  SFCCustomBlock
} from '@vue/component-compiler-utils'
import { createFilter } from 'rollup-pluginutils'
import * as queryString from 'querystring'
import * as path from 'path'

const GET_QUERY = /\.vue(\.[a-z]+?)?\?(.+)$/i
const PARAM_NAME = 'rollup-plugin-vue'

export interface VuePartRequest {
  filename: string
  meta: VuePartRequestMeta
}

export interface VuePartRequestMeta {
  type: 'template' | 'script' | 'styles' | 'customBlocks'
  lang: string
  index?: number
}

export function createVueFilter(
  include: Array<string | RegExp> | string | RegExp = [/\.vue$/i],
  exclude: Array<string | RegExp> | string | RegExp = []
): (file: string) => boolean {
  const filter = createFilter(include, exclude)

  return id => filter(id)
}

export function getVueMetaFromQuery(id: string): VuePartRequestMeta | null {
  const match = GET_QUERY.exec(id)

  if (match) {
    const query = queryString.parse(match[2])

    if (PARAM_NAME in query) {
      const data: string = (Array.isArray(query[PARAM_NAME])
        ? (query[PARAM_NAME] as any)[0]
        : query[PARAM_NAME]) as string

      let [type, index, lang] = data.split('.')

      if (!/^(template|styles|script)$/i.test(type)) {
        type = 'customBlocks'
      }

      return (lang
        ? { type, lang, index: parseInt(index) } // styles.0.css
        : { type, lang: index }) as VuePartRequestMeta // script.js
    }
  }

  return null
}

export function isVuePartRequest(id: string): boolean {
  return getVueMetaFromQuery(id) !== null
}

export function isVueStyleRequest(id: string): boolean {
  const query = getVueMetaFromQuery(id)

  return query !== null && query.type === 'styles'
}

export function createVuePartRequest(
  filename: string,
  lang: string | undefined,
  type: string,
  index?: number
): string {
  lang = lang || DEFAULT_LANGS[type]

  const match = GET_QUERY.exec(filename)

  const query = match ? queryString.parse(match[2]) : {}

  query[PARAM_NAME] = [type, index, lang]
    .filter(it => it !== undefined)
    .join('.')

  return `${path.basename(filename)}?${queryString.stringify(query)}`
}

export const DEFAULT_LANGS: Record<string, string> = {
  template: 'html',
  style: 'css',
  script: 'js',
  docs: 'md',
  i18n: 'json'
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

export function resolveVuePart(
  descriptors: Map<string, SFCDescriptor>,
  { filename, meta }: VuePartRequest
): SFCBlock | SFCCustomBlock {
  const descriptor = descriptors.get(filename)

  if (!descriptor) throw Error('File not processed yet, ' + filename)

  const blocks = descriptor[meta.type]
  const block = Array.isArray(blocks) ? blocks[meta.index as number] : blocks

  if (!block)
    throw Error(
      `Requested (type=${meta.type} & index=${
        meta.index
      }) block not found in ${filename}`
    )

  return block
}

export function transformRequireToImport(code: string): string {
  const imports: { [key: string]: string } = {}
  let strImports = ''

  code = code.replace(
    /require\(("(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+')\)/g,
    (_, name): any => {
      if (!(name in imports)) {
        imports[name] = `__$_require_${name
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_|_$/g, '')}__`
        strImports += 'import ' + imports[name] + ' from ' + name + '\n'
      }

      return imports[name]
    }
  )

  return strImports + code
}
