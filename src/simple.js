import { createVueFilter } from './utils'
import { createDefaultCompiler, assemble } from '@vue/component-compiler'
import { relative } from 'path'

export default function vue(opts = {}) {
  const isVue = createVueFilter(opts.include, opts.exclude)

  delete opts.include
  delete opts.exclude

  const compiler = createDefaultCompiler(opts)

  return {
    name: 'vue',

    async transform(source, filename) {
      if (!isVue(filename)) return

      const descriptor = compiler.compileToDescriptor(filename, source)

      if (
        descriptor.template &&
        descriptor.template.errors &&
        descriptor.template.errors.length
      ) {
        console.error(
          '> Errors: ' +
            relative(process.cwd(), filename) +
            '\n' +
            descriptor.template.errors.map(it => '  - ' + it).join('\n')
        )
      }

      if (
        descriptor.template &&
        descriptor.template.tips &&
        descriptor.template.tips.length
      ) {
        console.log(
          '> Tips: ' +
            relative(process.cwd(), filename) +
            '\n' +
            descriptor.template.tips.map(it => '  - ' + it).join('\n')
        )
      }

      const result = assemble(compiler, filename, descriptor)

      return result.code
    }
  }
}
