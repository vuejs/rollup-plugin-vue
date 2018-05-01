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
  const compiler = createDefaultCompiler(opts.compiler)
  createVuePartRequest.defaultLang = {
    ...createVuePartRequest.defaultLang,
    ...opts.defaultLang
  }

  const blacklisted = new Set(opts.blacklistCustomBlocks || [])

  delete opts.include
  delete opts.exclude

  const descriptors = new WeakMap()

  function compileTemplate(id, { functional }, source) {
    const { template } = compiler.compileToDescriptor(
      id.filename,
      `<template ${functional ? 'functional' : ''}>\n${source}\n</template>`
    )

    if (template.errors && template.errors.length) {
      console.error(
        '> Errors: ' +
          relative(process.cwd(), id.filename) +
          '\n' +
          template.errors.map(it => '  - ' + it).join('\n')
      )
    }

    if (template.tips && template.tips.length) {
      console.log(
        '> Tips: ' +
          relative(process.cwd(), id.filename) +
          '\n' +
          template.tips.map(it => '  - ' + it).join('\n')
      )
    }

    return `${template.code}\n export { render, staticRenderFns }`
  }

  return {
    name: 'vue.delegate',

    resolveId(id) {
      if (isVuePartRequest(id)) {
        const ref = parseVuePartRequest(id)
        const element = resolveVuePart(descriptors, ref)

        if (element.src)
          return path.resolve(path.dirname(ref.filename), element.src)

        return id
      }
    },

    load(id) {
      if (!isVuePartRequest(id)) return

      id = parseVuePartRequest(id)

      return resolveVuePart(descriptors, id).content
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
          styles: [],
          customBlocks: []
        }

        if (descriptor.template) {
          input.template = {
            code: `
            import * as template from '${createVuePartRequest(
              filename,
              descriptor.template.lang,
              'template'
            )}'
            var render = template.render
            var staticRenderFns = template.staticRenderFns 
            `,
            functional: 'functional' in descriptor.template.attrs
          }
        }

        if (descriptor.script) {
          input.script = {
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
        }

        const result = assemble(compiler, filename, input, opts)

        descriptor.customBlocks.forEach((block, index) => {
          if (blacklisted.has(block.type)) return
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

      if (isVuePartRequest(filename)) {
        const id = parseVuePartRequest(filename)
        const element = resolveVuePart(descriptors, id)

        if (id.meta.type === 'styles') {
          const { styles } = compiler.compileToDescriptor(
            id.filename,
            `<style ${element.scoped ? 'scoped' : ''} ${
              element.module
                ? 'module' +
                  (typeof element.module === 'string'
                    ? '="' + element.module + '"'
                    : '')
                : ''
            }>\n${source}\n</style>`
          )

          return styles[0]
        } else if (id.meta.type === 'template') {
          return compileTemplate(id, element, source)
        }
      }
    }
  }
}
