import {
  createVueFilter,
  isVuePartRequest,
  createVuePartRequest,
  parseVuePartRequest,
  resolveVuePart
} from './utils'
import * as path from 'path'
import { parse } from '@vue/component-compiler-utils'
import { createDefaultCompiler, assemble } from '@vue/component-compiler'
import hash from 'hash-sum'
import { relative } from 'path'

export default function vue(opts = {}) {
  const isVue = createVueFilter(opts.include, opts.exclude)
  const isProduction = process.env.NODE_ENV === 'production'

  createVuePartRequest.defaultLang = {
    ...createVuePartRequest.defaultLang,
    ...opts.defaultLang
  }

  const shouldExtractCss = opts.css === false
  const blacklisted = new Set(opts.blacklistCustomBlocks || ['*'])
  const whitelisted = new Set(opts.blacklistCustomBlocks || [])

  const isAllowed = any =>
    (!blacklisted.has('*') || !blacklisted.has(any)) &&
    (whitelisted.has('*') || whitelisted.has(any))

  delete opts.css
  delete opts.blacklistCustomBlocks
  delete opts.defaultLang
  delete opts.include
  delete opts.exclude

  const compiler = createDefaultCompiler(opts)
  const descriptors = new WeakMap()

  return {
    name: 'vue.delegate',

    resolveId(id) {
      if (isVuePartRequest(id)) {
        const ref = parseVuePartRequest(id)
        const element = resolveVuePart(descriptors, ref)

        if (element.src && ref.meta.type !== 'styles')
          return path.resolve(path.dirname(ref.filename), element.src)

        return id
      }
    },

    load(id) {
      if (!isVuePartRequest(id)) return

      id = parseVuePartRequest(id)

      const element = resolveVuePart(descriptors, id)

      return element.code || element.content
    },

    async transform(source, filename) {
      if (isVue(filename)) {
        const descriptor = (descriptors[filename] = parse({
          filename,
          source,
          needMap: true
        }))
        const scopeId =
          'data-v-' +
          (isProduction
            ? hash(path.basename(filename) + source)
            : hash(filename + source))
        const input = {
          scopeId,
          styles: descriptor.styles.map(style =>
            compiler.compileStyle(filename, scopeId, style)
          ),
          customBlocks: []
        }

        if (descriptor.template) {
          input.template = compiler.compileTemplate(
            filename,
            descriptor.template
          )

          if (input.template.errors && input.template.errors.length) {
            console.error(
              '> Errors: ' +
                relative(process.cwd(), filename) +
                '\n' +
                input.template.errors.map(it => '  - ' + it).join('\n')
            )
          }

          if (input.template.tips && input.template.tips.length) {
            console.log(
              '> Tips: ' +
                relative(process.cwd(), filename) +
                '\n' +
                input.template.tips.map(it => '  - ' + it).join('\n')
            )
          }
        }

        input.script = descriptor.script
          ? {
              code: `
            export * from '${createVuePartRequest(
              filename,
              descriptor.script.lang,
              'script'
            )}'
            import script from '${createVuePartRequest(
              filename,
              descriptor.script.lang,
              'script'
            )}'
            export default script
            `
            }
          : { code: '' }

        if (shouldExtractCss) {
          input.styles = input.styles
            .map((style, index) => {
              descriptor.styles[index].code = style.code

              input.script.code +=
                '\n' +
                `import '${createVuePartRequest(
                  filename,
                  'css',
                  'styles',
                  index
                )}'`

              if (style.module) {
                return { ...style, code: '' }
              }
            })
            .filter(Boolean)
        }

        const result = assemble(compiler, filename, input, opts)

        descriptor.customBlocks.forEach((block, index) => {
          if (!isAllowed(block.type)) return
          result.code +=
            '\n' +
            `export * from '${createVuePartRequest(
              filename,
              block.attrs.lang ||
                createVuePartRequest.defaultLang[block.type] ||
                block.type,
              'customBlocks',
              index
            )}'`
        })

        return result
      }
    }
  }
}
