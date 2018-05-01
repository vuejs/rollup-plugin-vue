import { createFilter } from 'rollup-pluginutils'

export function createVueFilter(include, exclude) {
  const filter = createFilter(include, exclude)

  return id => filter(id) && id.endsWith('.vue')
}

const REGEX = /\.vue\?{[^}]+}#\.[a-z]+$/i
export function isVuePartRequest(id) {
  return REGEX.test(id)
}

export function createVuePartRequest(filename, lang, type, index) {
  return (
    filename +
    '?' +
    JSON.stringify({ type, index }) +
    '#.' +
    (lang || createVuePartRequest.defaultLang[type])
  )
}

createVuePartRequest.defaultLang = {
  template: 'html',
  styles: 'css',
  script: 'js'
}

/**
 * @export
 * @param {string} id
 * @returns {{filename: string, meta: { type: string, index?: number }} | undefined}
 */
export function parseVuePartRequest(id) {
  if (!id.includes('.vue')) return
  const length = id.indexOf('.vue') + 4
  const filename = id.substr(0, length)
  const query = id.substr(length + 1).replace(/#.[a-z]+$/, '')

  try {
    const meta = JSON.parse(query)

    return {
      filename,
      meta
    }
  } catch (e) {}
}

export function resolveVuePart(descriptors, id) {
  const descriptor = descriptors[id.filename]
  const part = descriptor[id.meta.type]

  return Array.isArray(part) ? part[id.meta.index] : part
}
