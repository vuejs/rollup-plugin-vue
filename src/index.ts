import {
  createVueFilter,
  createVuePartRequest,
} from './utils'
import { parseVueRequest } from './utils/query'
import { getDescriptor } from './utils/descriptorCache'
import { transformSFC } from './sfc'
import { transformTemplate } from './template'
import { transformStyle } from './style'
import {  componentNormalizerPath, normalizeComponentCode } from './runtime/componentNormalizer'
import {
  ScriptOptions,
  StyleOptions,
  TemplateOptions,
} from '@vue/component-compiler'
import { Plugin } from 'rollup'
import hash from 'hash-sum'
import fs from 'fs'
import path from 'path'
import debug from 'debug'
import {
  VueTemplateCompilerOptions,
} from '@vue/component-compiler-utils/dist/types'
import { VuePluginOptions } from './interface'

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

// Official VueTemplateCompilerOptions does not expose scopeId as a part of public API
// ScopeId is required to correctly compile Vue template with SSR optimization.
interface TemplateOptionsRollup extends TemplateOptions {
  compilerOptions: VueTemplateCompilerOptions & {
    scopeId?: string
  }
}

export interface VueCompilerOptions {
  script?: ScriptOptions
  style?: StyleOptions
  template?: TemplateOptionsRollup
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
  if (opts.shadowMode) {
    opts.isWebComponent = true
  }

  createVuePartRequest.defaultLang = {
    ...createVuePartRequest.defaultLang,
    ...opts.defaultLang
  }

  // const shouldExtractCss = opts.css === false
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

  // const descriptors = new Map<string, SFCDescriptor>()

  if (opts.css === false) {
    d('Running in CSS extract mode')
  }

  const sourceRoot = opts.sourceRoot || process.cwd()

  return {
    name: 'VuePlugin',

    resolveId(id, importer) {
      dR(`ResolveId(${id}), importer: ${importer || ''}`)
      if (id === componentNormalizerPath) {
        return id
      }

      const { query } = parseVueRequest(id)

      if (query.vue) {
        return id
      }
    },

    load(id: string) {
      if (id === componentNormalizerPath) {
        return normalizeComponentCode
      }

      const { query, filename } = parseVueRequest(id)

      if (query.vue) {
        if (query.src) {
          return fs.readFileSync(filename, 'utf-8')
        }

        const descriptor = getDescriptor(filename)

        if (descriptor) {
          const block =
            query.type === 'script'
              ? descriptor.script
              : query.type === 'template'
              ? descriptor.template
              : query.type === 'style'
              ? descriptor.styles[query.index!]
              : query.index !== undefined
              ? descriptor.customBlocks[query.index]
              : null

          if (block) {
            dL(
              `id: ${id}\ncode: \n${block.content}\nmap: ${JSON.stringify(
                block.map,
                null,
                2
              )}\n\n`
            )
            return {
              code: block.content,
              map: block.map as any
            }
          }
        }
      }

      return null
    },

    async transform(code: string, id: string) {
      const { query, filename } = parseVueRequest(id)

      if (!query.vue && !isVue(id)) {
        return
      }

      const shortFilePath = path
          .relative(sourceRoot, filename)
          .replace(/^(\.\.[\/\\])+/, '')
          .replace(/\\/g, '/')

        const scopeId = hash(
          isProduction ? shortFilePath + '\n' + code.replace(/\r\n/g, '\n') : shortFilePath
        )

      if (!query.vue) {
        const output = transformSFC(
          filename,
          code,
          sourceRoot,
          scopeId,
          this
        )
        if (output) {
          dT(`SFC entry code:`, `\n${output.code}\n`)
        }

        return output
      }

      // sub request for blocks
      if (query.vue) {
        if (!query.src && !isVue(filename)) {
          return { code: '' }
        }

        if (query.type === 'template') {
          dT(`transform template ${id}`)
          return transformTemplate(code, filename, opts, this)
        }

        if (query.type === 'style' && query.index !== undefined) {
          dT(`transform style ${id}`)
          return transformStyle(code, filename, scopeId, Number(query.index), opts, this)
        }
      }
    }
  }
}
