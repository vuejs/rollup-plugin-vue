import {createFilter} from 'rollup-pluginutils'
import Compiler from './compiler'
import objectAssign from 'object-assign'
import path from 'path'

export default function plugin (options = {}) {
  options = objectAssign({}, options, {extensions: ['.vue'] })
  let filter = createFilter(options.include, options.exclude)
  const extensions = options.extensions
  delete options.extensions
  delete options.include
  delete options.exclude

  const compiler = new Compiler(options)

  return {
    transform (code, id) {
      if (!filter(id)) { return null }
      if (extensions.indexOf(path.extname(id)) === -1) { return null }

      return new Promise((resolve) => {
        compiler
            .compile(code, id)
            .then((compiled) => resolve(compiled))
      })
    }
  }
}
