import {createFilter} from 'rollup-pluginutils'
import vueTransform from './vueTransform'
import writeStyles from './writeStyles'

export default function vue (options = {}) {
  let filter = createFilter(options.include, options.exclude)
  let cssContent = {}
  let cssLang = {}
  let dest = 'bundle.js'

  return {
    name: 'vue',
    options (options) {
      // Get the bundle destination
      dest = options.dest
    },
    transform (source, id) {
      if (!filter(id) || !id.endsWith('.vue')) {
        return null
      }

      var ref = vueTransform(source, id)

      // Map of every stylesheet content
      cssContent[id] = ref.css || ''

      // Map of every stylesheet lang
      cssLang[id] = ref.cssLang || 'css'

      // Component javascript with inlined html template
      return ref.js
    },
    banner () {
      // Abusing the banner method to write styles
      var count = 0
      for (let key in cssContent) {
        count += cssContent[key].length
      }
      if (count) {
        writeStyles(cssContent, cssLang, dest)
      }
      return ''
    }
  }
}
