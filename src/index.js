import { createFilter } from 'rollup-pluginutils'
import * as compiler from 'vue-component-compiler'
import * as path from 'path'
import logger from 'debug'

const debug = logger('rollup-plugin-vue')

const cache = {} // TODO: Replace with real cache.

function s(any) {
  return JSON.stringify(any, null, 2)
}

function relative(p) {
  if (p.startsWith(process.cwd())) {
    p = p.replace(process.cwd(), '')
    p = p.replace(/^[\\/]/, '')
  }

  return p
}

function inline(src) {
  return `import target from '${src}'\nexport default target`
}

function inlineStyle(
  { id, index, code, map, modules },
  descriptor,
  { isServer, isProduction, inject }
) {
  let output = `const cssModules = ${modules ? s(modules) : '{}'}\n`

  output +=
    `export const style = ${s(code)}\n` +
    `export const map = ${s(map)}\n` +
    `const content = [[${index}, style, ${descriptor.attrs.media &&
      s(descriptor.attrs.media)}, ${isProduction ? 'undefined' : 'map'} ]]\n`
  if (inject) {
    if (isServer) {
      output +=
        `import inject from 'vue-component-compiler/src/runtime/inject-style-server'\n` +
        `cssModules.__inject__ = context => inject(${s(
          id
        )}, content, ${isProduction}, context)\n`
    } else {
      output +=
        `import inject from 'vue-component-compiler/src/runtime/inject-style-client'\n` +
        `cssModules.__inject__ = () => inject(${s(
          id
        )}, content, ${isProduction})\n`
    }
  }
  output += `export default cssModules`

  return output
}

function makeId(id, type, lang, index) {
  return id + '?' + JSON.stringify({ type, index }) + '#.' + lang
}

export default function vue(opts = {}) {
  debug('Yo! rolling vue!')
  const filter = createFilter(opts.include, opts.exclude)

  delete opts.include
  delete opts.exclude

  const vueOptions = {
    hasStyleInjectFn: true,
    isServer: opts.server === true || process.env.VUE_ENV === 'server',
    isProduction:
      opts.production === true || process.env.NODE_ENV === 'production'
  }

  const cwd = process.cwd()
  function parseId(id) {
    const relative = path.relative(cwd, id)
    if (/\.vue\?\{[^#]+\}#\./.test(id)) {
      const start = id.lastIndexOf('?')
      const end = id.lastIndexOf('#')

      try {
        const parsed = JSON.parse(id.substring(start + 1, end))
        parsed.id = id.substring(0, start)
        parsed.relative = relative

        return parsed
      } catch (e) {
        console.error(e)
      }
    }

    if (!filter(id) || id.endsWith('.vue')) return { sfc: true, id, relative }

    return { ignore: true, id, relative }
  }

  return {
    name: 'vue',

    resolveId(request) {
      const q = parseId(request)

      if (q.ignore || q.sfc) return

      debug(`  > Resolve --> ${q.relative}`)

      const descriptor = cache[q.id]

      if (!descriptor) throw Error(`SFC (${q.id}) is not processed.`)

      switch (q.type) {
        case 'template':
          const template = descriptor.template
          if (template && template.src)
            return path.resolve(path.dirname(q.id), template.src)
          break
        case 'script':
          const style = descriptor.styles[q.index]
          if (style && style.src)
            return path.resolve(path.dirname(q.id), style.src)
          break
        case 'custom':
          const custom = descriptor.customBlocks[q.index]
          if (custom && custom.src)
            return path.resolve(path.dirname(q.id), custom.src)
          break
      }

      return request
    },

    load(request) {
      const q = parseId(request)

      if (q.ignore || q.sfc) return

      debug(`  > Load    --> ${q.relative}`)

      const id = q.id
      const filename = relative(id)
      const descriptor = cache[id]

      if (!descriptor) throw Error(`SFC (${filename}) is not processed.`)

      switch (q.type) {
        case 'template':
          if (!descriptor.template) return ''
          if (descriptor.template.src) return

          return {
            code: descriptor.template.content,
            map: descriptor.template.map
          }
        case 'script':
          if (!descriptor.script)
            return { code: 'export default {}\n', map: { mappings: '' } }

          return {
            code: descriptor.script.src
              ? inline(descriptor.script.src)
              : descriptor.script.content,
            map: descriptor.script.map
          }
        case 'style':
          const style = descriptor.styles[q.index]
          if (style.src) return
          return {
            code: style.content,
            map: style.map
          }
        case 'custom':
          const block = descriptor.customBlocks[q.index]
          if (block.src) return
          return block.content
      }
    },

    async transform(source, request) {
      const q = parseId(request)

      if (q.ignore || q.dep) return

      const filename = relative(q.id)
      const scopeId = compiler.generateScopeId(
        filename,
        source,
        vueOptions.isProduction
      )

      if (q.sfc) {
        debug(`>> Transform: ${q.relative}`)
        const descriptor = compiler.parse(source, filename)

        cache[q.id] = descriptor

        const code = compiler.assemble(
          {
            script: {
              id:
                descriptor.script &&
                makeId(q.id, 'script', descriptor.script.lang || 'js'),
              descriptor: descriptor.script
            },
            render: {
              id:
                descriptor.template &&
                makeId(q.id, 'template', descriptor.template.lang || 'html'),
              descriptor: descriptor.template
            },
            styles: descriptor.styles.map((style, index) => ({
              id: makeId(q.id, 'style', style.lang || 'css', index),
              descriptor: style
            })),
            customBlocks: vueOptions.isProduction
              ? []
              : descriptor.customBlocks.map((block, index) => ({
                  id: makeId(q.id, 'custom', block.lang || block.type),
                  descriptor: block
                }))
          },
          filename,
          { ...vueOptions, scopeId, moduleIdentifier: scopeId }
        )

        return { code, map: { mappings: '' } }
      }

      if (q.type === 'template') {
        debug(`  > Compile --> ${q.relative}`)
        const output = compiler.compileTemplate(
          { code: source, descriptor: cache[q.id].template },
          q.id,
          { ...vueOptions, scopeId }
        )

        if (output.map) output.map = { mappings: '' }

        return output
      }

      if (q.type === 'style') {
        debug(`  > Compile --> ${q.relative}`)

        const style = cache[q.id].styles[q.index]
        const result = await compiler.compileStyle(
          { code: source, descriptor: style },
          q.id,
          { ...vueOptions, scopeId, async: true }
        )

        return {
          code: inlineStyle(
            {
              id: path.relative(cwd, q.id),
              index: q.index,
              code: result.code,
              modules: result.modules,
              map: result.map
            },
            style,
            { ...vueOptions, inject: !opts.extract }
          ),
          map: { mappings: '' }
        }
      }
    }
  }
}
