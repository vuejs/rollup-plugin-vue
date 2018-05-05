import { createFilter } from 'rollup-pluginutils'
import querystring from 'querystring'

const GET_QUERY = /\.vue(\.[a-z]+?)?\?(.+)$/i
const PARAM_NAME = 'rollup_plugin_vue'

export function createVueFilter(include, exclude) {
  const filter = createFilter(include, exclude)

  return id => filter(id) && id.endsWith('.vue')
}

export function getQueryParams(id) {
  let query

  if (!(query = GET_QUERY.exec(id))) return null

  query = querystring.parse(query[2])
  query = query[PARAM_NAME] ? JSON.parse(query[PARAM_NAME]) : null

  return query
}

export function isVuePartRequest(id) {
  return getQueryParams(id) !== null
}

export function createVuePartRequest(filename, lang, type, index) {
  lang = lang || createVuePartRequest.defaultLang[type]

  const value = JSON.stringify({ type, index, lang })
  const toEncode = {
    [PARAM_NAME]: value
  }

  return `${filename}.${lang}?${querystring.stringify(toEncode)}`
}

createVuePartRequest.defaultLang = {
  template: 'html',
  styles: 'css',
  script: 'js'
}

/**
 * @export
 * @param {string} id
 * @returns {{filename: string, meta: { type: string, lang: string, index?: number }} | undefined}
 */
export function parseVuePartRequest(id) {
  if (!id.includes('.vue')) return

  const length = id.indexOf('.vue') + 4
  const filename = id.substr(0, length)

  const params = getQueryParams(id)

  if (params === null) return

  return {
    filename,
    meta: params
  }
}

export function resolveVuePart(descriptors, vuePart) {
  const descriptor = descriptors[vuePart.filename]
  const part = descriptor[vuePart.meta.type]

  return Array.isArray(part) ? part[vuePart.meta.index] : part
}
