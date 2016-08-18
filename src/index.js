import {createFilter} from 'rollup-pluginutils'
import vueTransform from './vueTransform'

export default function vue (options = {}) {
  let filter = createFilter(options.include, options.exclude)

  return {
    name: 'vue',
    transform (code, id) {
      if (!filter(id) || !id.endsWith('.vue')) {
        return null
      }

      return vueTransform(code, id)
    }
  }
}
