import {createFilter} from 'rollup-pluginutils'
import {writeFile} from 'fs'

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
      if (options.css === false) {
        return
      }

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

      writeFile(options.css, css, function (err) {
        if (err) {
          throw err
        }
        emitted(options.css, css.length)
      })
    }
  }
}

function emitted (text, bytes) {
  console.log(green(text), getSize(bytes))
}

function green (text) {
  return '\u001b[1m\u001b[32m' + text + '\u001b[39m\u001b[22m'
}

function getSize (bytes) {
  bytes /= 1024
  return bytes < 1000 ? bytes.toPrecision(3) + ' kB' : (bytes / 1024).toPrecision(3) + ' MB'
}
