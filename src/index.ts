import {
  createVueFilter,
  createVuePartRequest,
  parseVuePartRequest,
  resolveVuePart
} from './utils'
import {
  createDefaultCompiler,
  assemble,
  AssembleOptions,
  ScriptOptions,
  StyleOptions,
  TemplateOptions,
  StyleCompileResult
} from '@vue/component-compiler'
import {Plugin} from 'rollup'
import * as path from 'path'
import {parse, SFCDescriptor} from '@vue/component-compiler-utils'

const hash = require('hash-sum')

export type VuePluginOptions = AssembleOptions & {
  include?: string
  exclude?: string
  defaultLang?: {
    [key: string]: string
  },
  blackListCustomBlocks?: string[]
  whiteListCustomBlocks?: string[]
  css?: boolean
  script?: ScriptOptions
  style?: StyleOptions
  template?: TemplateOptions
}

export default function VuePlugin(opts: VuePluginOptions = {}): Plugin {
  const isVue = createVueFilter(opts.include, opts.exclude)
  const isProduction = process.env.NODE_ENV === 'production'

  createVuePartRequest.defaultLang = {
    ...createVuePartRequest.defaultLang,
    ...opts.defaultLang
  }

  const shouldExtractCss = opts.css === false
  const blacklisted = new Set(opts.blackListCustomBlocks || ['*'])
  const whitelisted = new Set(opts.whiteListCustomBlocks || [])

  const isAllowed = (customBlockType: string) =>
    (!blacklisted.has('*') || !blacklisted.has(customBlockType)) &&
    (whitelisted.has('*') || whitelisted.has(customBlockType))

  delete opts.css
  delete opts.blackListCustomBlocks
  delete opts.whiteListCustomBlocks
  delete opts.defaultLang
  delete opts.include
  delete opts.exclude

  const compiler = createDefaultCompiler(opts)
  const descriptors = new Map<string, SFCDescriptor>()

  return {
    name: 'vue.delegate',

    resolveId(id) {
      const ref = parseVuePartRequest(id)
      if (ref) {
        const element = resolveVuePart(descriptors, ref)
        if ('src' in element && ref.meta.type !== 'styles') {
          return path.resolve(path.dirname(ref.filename), (element as any).src as string)
        }

        return id
      }
    },

    load(id: string) {
      const request = parseVuePartRequest(id)

      if (!request) return

      const element = resolveVuePart(descriptors, request)

      return 'code' in element
        ? (element as any).code as string // .code is set when extract styles is used. { css: false }
        : element.content
    },

    async transform(source: string, filename: string) {
      if (isVue(filename)) {
        const descriptor = parse({
          filename,
          source,
          needMap: true
        })

        const scopeId =
          'data-v-' +
          (isProduction
            ? hash(path.basename(filename) + source)
            : hash(filename + source))
        descriptors.set(filename, descriptor)
        const input: any = {
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
              path.relative(process.cwd(), filename) +
              '\n' +
              input.template.errors.map((error: string) => '  - ' + error).join('\n')
            )
          }

          if (input.template.tips && input.template.tips.length) {
            console.log(
              '> Tips: ' +
              path.relative(process.cwd(), filename) +
              '\n' +
              input.template.tips.map((tip: string) => '  - ' + tip).join('\n')
            )
          }
        }

        input.script = descriptor.script
          ? {
            code: `
            export * from '${createVuePartRequest(
              filename,
              descriptor.script.lang || 'js',
              'script'
            )}'
            import script from '${createVuePartRequest(
              filename,
              descriptor.script.lang || 'js',
              'script'
            )}'
            export default script
            `
          }
          : {code: ''}

        if (shouldExtractCss) {
          input.styles = input.styles
            .map((style: StyleCompileResult, index: number) => {
              (descriptor.styles[index] as any).code = style.code

              input.script.code +=
                '\n' +
                `import '${createVuePartRequest(
                  filename,
                  'css',
                  'styles',
                  index
                )}'`

              if (style.module || descriptor.styles[index].scoped) {
                return {...style, code: ''}
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
