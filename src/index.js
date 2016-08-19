import humanSize from 'human-size'
import {createFilter} from 'rollup-pluginutils'
import {writeFileSync} from 'fs'

import vueTransform from './vueTransform'

export default function vue (options = {}) {
  let filter = createFilter(options.include, options.exclude)
  let cssContent = {}
  let cssLang = {}
  let dest = 'bundle.js'

  return {
    name: 'vue',
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
    ongenerate (opts) {

      // Combine all stylesheets
      var css = ''
      for (let key in cssContent) {
        css += cssContent[key]
      }

      // Emit styles through callback or file
      if (typeof options.css === 'function') {
        return options.css(css)
      }

      // Guess destination filename
      if (typeof options.css !== 'string') {
        dest = opts.dest || 'bundle.js'
        if (dest.endsWith('.js')) {
          dest = dest.slice(0, -3)
        }
        options.css = dest + '.css'
      }

      console.log('Writing', humanSize(css.length), 'to', options.css)
      writeFileSync(options.css, css)
    }
  }
}
