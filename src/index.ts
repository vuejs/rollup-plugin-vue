import {
  createVueFilter,
  createVuePartRequest,
  parseVuePartRequest,
  resolveVuePart,
  isVuePartRequest,
  transformRequireToImport
} from './utils'
import {
  createDefaultCompiler,
  assemble,
  ScriptOptions,
  StyleOptions,
  TemplateOptions,
  StyleCompileResult,
  DescriptorCompileResult
} from '@vue/component-compiler'
import MagicString from 'magic-string'
import { Plugin, RawSourceMap } from 'rollup'
import * as path from 'path'
import { parse, SFCDescriptor, SFCBlock } from '@vue/component-compiler-utils'
import debug from 'debug'
import {
  VueTemplateCompiler,
  VueTemplateCompilerOptions,
  VueTemplateCompilerParseOptions
} from '@vue/component-compiler-utils/dist/types'

const templateCompiler = require('vue-template-compiler')
const hash = require('hash-sum')
const { version } = require('../package.json')

const d = debug('rollup-plugin-vue')
const dR = debug('rollup-plugin-vue:resolve')
const dL = debug('rollup-plugin-vue:load')
const dT = debug('rollup-plugin-vue:transform')

export interface VuePluginOptionsData {
  css: string | (() => string)
  less: string | (() => string)
  postcss: string | (() => string)
  sass: string | (() => string)
  scss: string | (() => string)
  stylus: string | (() => string)
}

export interface VuePluginOptions {
  /**
   * Include files or directories.
   * @default `'.vue'`
   */
  include?: Array<string | RegExp> | string | RegExp
  /**
   * Exclude files or directories.
   * @default `undefined`
   */
  exclude?: Array<string | RegExp> | string | RegExp
  /**
   * Default language for blocks.
   *
   * @default `{}`
   * @example
   * ```js
   * VuePlugin({ defaultLang: { script: 'ts' } })
   * ```
   */
  defaultLang?: {
    [key: string]: string
  }
  /**
   * Exclude/Include customBlocks for final build.
   * @default `() => false`
   * @example
   * ```js
   * VuePlugin({ customBlocks: ['markdown', '!test'] })
   * ```
   */
  customBlocks?: string[] | ((tag: string) => boolean)

  /**
   * Exclude customBlocks for final build.
   * @default `['*']`
   * @deprecated
   * @example
   * ```js
   * VuePlugin({ blackListCustomBlocks: ['markdown', 'test'] })
   * ```
   */
  blackListCustomBlocks?: string[]
  /**
   * Include customBlocks for final build.
   * @default `[]`
   * @deprecated
   * @example
   * ```js
   * VuePlugin({ blackListCustomBlocks: ['markdown', 'test'] })
   * ```
   */
  whiteListCustomBlocks?: string[]

  /**
   * Prepend CSS.
   * @default `undefined`
   * @example
   * ```js
   * VuePlugin({ data: { scss: '$color: red;' } }) // to extract css
   * ```
   */
  data?: Partial<VuePluginOptionsData>

  /**
   * Inject CSS in JavaScript.
   * @default `true`
   * @example
   * ```js
   * VuePlugin({ css: false }) // to extract css
   * ```
   */
  css?: boolean
  /**
   * Expose filename in __file property.
   * @default `false`
   * @example
   * ```js
   * VuePlugin({ exposeFilename: true })
   * ```
   */
  exposeFilename?: boolean
  compiler?: VueTemplateCompiler
  compilerParseOptions?: VueTemplateCompilerParseOptions
  sourceRoot?: string
  /**
   * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) script processing options.
   */
  script?: ScriptOptions
  /**
   * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) style processing options.
   */
  style?: StyleOptions
  /**
   * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) template processing options.
   */
  template?: TemplateOptions
  /**
   * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) module name or global function for custom runtime component normalizer.
   */
  normalizer?: string
  /**
   * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) module name or global function for custom style injector factory.
   */
  styleInjector?: string
  /**
   * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) module name or global function for custom style injector factory for SSR environment.
   */
  styleInjectorSSR?: string

  styleInjectorShadow?: string

  isWebComponent?: boolean

  beforeAssemble?(descriptor: DescriptorCompileResult): DescriptorCompileResult
}

// Official VueTemplateCompilerOptions does not expose scopeId as a part of public API
// ScopeId is required to correctly compile Vue template with SSR optimization.
interface TemplateOptionsRollup extends TemplateOptions {
  compilerOptions: VueTemplateCompilerOptions & {
    scopeId?: string
  }
}

interface VueCompilerOptions {
  script?: ScriptOptions | undefined;
  style?: StyleOptions | undefined;
  template?: TemplateOptionsRollup | undefined;
}
/**
 * Rollup plugin for handling .vue files.
 */
export default function vue(opts: Partial<VuePluginOptions> = {}): Plugin {
  const isVue = createVueFilter(opts.include, opts.exclude)
  const isProduction =
    opts.template && typeof opts.template.isProduction === 'boolean'
      ? opts.template.isProduction
      : process.env.NODE_ENV === 'production' ||
        process.env.BUILD === 'production'

  d('Version ' + version)
  d(`Build environment: ${isProduction ? 'production' : 'development'}`)
  d(`Build target: ${process.env.VUE_ENV || 'browser'}`)

  if (!opts.normalizer)
    opts.normalizer = '~' + 'vue-runtime-helpers/dist/normalize-component.mjs'
  if (!opts.styleInjector)
    opts.styleInjector =
      '~' + 'vue-runtime-helpers/dist/inject-style/browser.mjs'
  if (!opts.styleInjectorSSR)
    opts.styleInjectorSSR =
      '~' + 'vue-runtime-helpers/dist/inject-style/server.mjs'
  if (!opts.styleInjectorShadow)
    opts.styleInjectorShadow =
      '~' + 'vue-runtime-helpers/dist/inject-style/shadow.mjs'

  createVuePartRequest.defaultLang = {
    ...createVuePartRequest.defaultLang,
    ...opts.defaultLang
  }

  const shouldExtractCss = opts.css === false
  const customBlocks: string[] = []

  if (opts.blackListCustomBlocks) {
    console.warn(
      '`blackListCustomBlocks` option is deprecated use `customBlocks`. See https://rollup-plugin-vue.vuejs.org/options.html#customblocks.'
    )
    customBlocks.push(...opts.blackListCustomBlocks.map(tag => '!' + tag))
  }
  if (opts.whiteListCustomBlocks) {
    console.warn(
      '`whiteListCustomBlocks` option is deprecated use `customBlocks`. See https://rollup-plugin-vue.vuejs.org/options.html#customblocks.'
    )
    customBlocks.push(...opts.whiteListCustomBlocks)
  }
  const isAllowed = createCustomBlockFilter(opts.customBlocks || customBlocks)

  const beforeAssemble =
    opts.beforeAssemble ||
    ((d: DescriptorCompileResult): DescriptorCompileResult => d)

  const exposeFilename =
    typeof opts.exposeFilename === 'boolean' ? opts.exposeFilename : false

  const data: VuePluginOptionsData = (opts.data || {}) as any

  delete opts.data
  delete opts.beforeAssemble
  delete opts.css
  delete opts.exposeFilename
  delete opts.customBlocks
  delete opts.blackListCustomBlocks
  delete opts.whiteListCustomBlocks
  delete opts.defaultLang
  delete opts.include
  delete opts.exclude

  opts.template = {
    transformAssetUrls: {
      video: ['src', 'poster'],
      source: 'src',
      img: 'src',
      image: 'xlink:href'
    },
    ...opts.template
  } as any

  if (opts.template && typeof opts.template.isProduction === 'undefined') {
    opts.template.isProduction = isProduction
  }

  const descriptors = new Map<string, SFCDescriptor>()

  if (opts.css === false) d('Running in CSS extract mode')

  const getCompiler = ({ scopeId }: { scopeId?: string}) => {
    const options: VueCompilerOptions = { ...opts }

    options.template = {
      ...options.template!,
      compilerOptions: {
        ...(options.template!.compilerOptions
          ? options.template!.compilerOptions
          : {}),
        scopeId: scopeId
      }
    }

    return createDefaultCompiler(options)
  }
  function prependStyle(
    id: string,
    lang: string,
    code: string,
    map: any
  ): { code: string } {
    if (!(lang in data)) return { code }
    const ms = new MagicString(code, {
      filename: id,
      indentExclusionRanges: []
    })

    const value: string | (() => string) = (data as any)[lang]
    const fn = typeof value === 'function' ? value : () => value

    ms.prepend(fn())

    return { code: ms.toString() }
  }

  return {
    name: 'VuePlugin',

    resolveId(id, importer) {
      const request = id
      if (id.startsWith('vue-runtime-helpers/')) {
        id = require.resolve(id)
        dR(`form: ${request} \nto: ${id}\n`)
        return id
      }
      if (!isVuePartRequest(id)) return
      id = path.resolve(path.dirname(importer), id)
      const ref = parseVuePartRequest(id)

      if (ref) {
        const element = resolveVuePart(descriptors, ref)
        const src = (element as SFCBlock).src
        if (ref.meta.type !== 'styles' && typeof src === 'string') {
          if (src.startsWith('.')) {
            return path.resolve(path.dirname(ref.filename), src as string)
          } else {
            return require.resolve(src, {
              paths: [path.dirname(ref.filename)]
            })
          }
        }

        dR(`from: ${request} \nto: ${id}\n`)
        return id
      }
    },

    load(id: string) {
      const request = parseVuePartRequest(id)

      if (!request) return null

      const element = resolveVuePart(descriptors, request)
      let code =
        'code' in element
          ? ((element as any).code as string) // .code is set when extract styles is used. { css: false }
          : element.content
      let map = element.map as RawSourceMap

      if (request.meta.type === 'styles') {
        code = prependStyle(id, request.meta.lang, code, map).code
      }

      dL(`id: ${id}\ncode: \n${code}\nmap: ${JSON.stringify(map, null, 2)}\n\n`)

      return { code, map }
    },

    async transform(source: string, filename: string) {
      if (isVue(filename)) {
        // Create deep copy to prevent issue during watching changes.
        const descriptor: SFCDescriptor = JSON.parse(
          JSON.stringify(
            parse({
              filename,
              source,
              compiler: opts.compiler || templateCompiler,
              compilerParseOptions: opts.compilerParseOptions,
              sourceRoot: opts.sourceRoot,
              needMap: 'needMap' in opts ? (opts as any).needMap : true
            })
          )
        )

        descriptors.set(filename, descriptor)

        const scopeId =
          'data-v-' +
          (isProduction
            ? hash(path.basename(filename) + source)
            : hash(filename + source))

        const hasScopedStyles = descriptor.styles.some(style => !!style.scoped)
        const compiler = getCompiler({
          scopeId: hasScopedStyles ? scopeId : undefined
        })

        const styles = await Promise.all(
          descriptor.styles.map(async style => {
            if (style.content) {
              style.content = prependStyle(
                filename,
                style.lang || 'css',
                style.content,
                style.map
              ).code
            }

            const compiled = await compiler.compileStyleAsync(
              filename,
              scopeId,
              style
            )
            if (compiled.errors.length > 0) throw Error(compiled.errors[0])
            return compiled
          })
        )

        const input: any = {
          scopeId,
          styles,
          customBlocks: []
        }

        if (descriptor.template) {
          input.template = compiler.compileTemplate(
            filename,
            descriptor.template
          )

          input.template.code = transformRequireToImport(input.template.code)

          if (input.template.errors && input.template.errors.length) {
            input.template.errors.map((error: Error) => this.error(error))
          }

          if (input.template.tips && input.template.tips.length) {
            input.template.tips.map((message: string) => this.warn({ message }))
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
            ${
              exposeFilename
                ? `
            // For security concerns, we use only base name in production mode. See https://github.com/vuejs/rollup-plugin-vue/issues/258
            script.__file = ${
              isProduction
                ? JSON.stringify(path.basename(filename))
                : JSON.stringify(filename)
            }`
                : ''
            }
            `
            }
          : { code: '' }

        if (shouldExtractCss) {
          input.styles = input.styles
            .map((style: StyleCompileResult, index: number) => {
              ;(descriptor.styles[index] as any).code = style.code

              input.script.code +=
                '\n' +
                `import '${createVuePartRequest(
                  filename,
                  'css',
                  'styles',
                  index
                )}'`

              if (style.module || descriptor.styles[index].scoped) {
                return { ...style, code: '', map: undefined }
              }
            })
            .filter(Boolean)
        }

        input.script.code = input.script.code.replace(/^\s+/gm, '')

        const result = assemble(compiler, filename, beforeAssemble(input), opts)

        descriptor.customBlocks.forEach((block, index) => {
          if (!isAllowed(block.type)) return
          result.code +=
            '\n' +
            `export * from '${createVuePartRequest(
              filename,
              (typeof block.attrs.lang === 'string' && block.attrs.lang) ||
                createVuePartRequest.defaultLang[block.type] ||
                block.type,
              'customBlocks',
              index
            )}'`
        })

        dT(
          `id: ${filename}\ncode:\n${result.code}\n\nmap:\n${JSON.stringify(
            result.map,
            null,
            2
          )}\n`
        )

        result.map = result.map || { mappings: '' }

        return result
      }
    }
  }
}

function createCustomBlockFilter(
  customBlocks?: string[] | ((tag: string) => boolean)
): (tag: string) => boolean {
  if (typeof customBlocks === 'function') return customBlocks
  if (!Array.isArray(customBlocks)) return () => false

  const allowed = new Set(customBlocks.filter(tag => !tag.startsWith('!')))
  const notAllowed = new Set(
    customBlocks.filter(tag => tag.startsWith('!')).map(tag => tag.substr(1))
  )

  return tag => {
    if (allowed.has(tag)) return true
    if (notAllowed.has(tag)) return false
    if (notAllowed.has('*')) return false
    return allowed.has('*')
  }
}
