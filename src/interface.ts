import {
  VueTemplateCompiler,
  VueTemplateCompilerParseOptions
} from '@vue/component-compiler-utils/dist/types'
import {
  ScriptOptions,
  StyleOptions,
  TemplateOptions,
  DescriptorCompileResult
} from '@vue/component-compiler'

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

  shadowMode?: boolean
  /**
   * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) style processing options.
   */
  style?: StyleOptions
  /**
   * @@vue/component-compiler [#](https://github.com/vuejs/vue-component-compiler#api) template processing options.
   */
  template?: Partial<TemplateOptions>
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
