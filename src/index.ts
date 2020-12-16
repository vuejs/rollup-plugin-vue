try {
  require.resolve('@vue/compiler-sfc')
} catch (e) {
  throw new Error(
    'rollup-plugin-vue requires @vue/compiler-sfc to be present in the dependency ' +
      'tree.'
  )
}

import {
  SFCTemplateCompileOptions,
  SFCAsyncStyleCompileOptions,
} from '@vue/compiler-sfc'
import fs from 'fs'
import createDebugger from 'debug'
import { Plugin } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import { genSfcFacade } from './sfcFacade'
import { transformTemplateAsModule } from './template'
import { transformStyle } from './style'
import { createCustomBlockFilter } from './utils/customBlockFilter'
import { getDescriptor, setDescriptor } from './utils/descriptorCache'
import { parseVuePartRequest } from './utils/query'
import { normalizeSourceMap } from './utils/sourceMap'
import { getResolvedScript } from './script'
import { handleHotUpdate } from './handleHotUpdate'

const debug = createDebugger('rollup-plugin-vue')

export interface Options {
  include: string | RegExp | (string | RegExp)[]
  exclude: string | RegExp | (string | RegExp)[]
  target: 'node' | 'browser'
  vite: boolean
  hmr: boolean
  exposeFilename: boolean
  customBlocks?: string[]

  // if true, handle preprocessors directly instead of delegating to other
  // rollup plugins
  preprocessStyles?: boolean

  // sfc template options
  templatePreprocessOptions?: Record<
    string,
    SFCTemplateCompileOptions['preprocessOptions']
  >
  compiler?: SFCTemplateCompileOptions['compiler']
  compilerOptions?: SFCTemplateCompileOptions['compilerOptions']
  transformAssetUrls?: SFCTemplateCompileOptions['transformAssetUrls']

  // sfc style options
  postcssOptions?: SFCAsyncStyleCompileOptions['postcssOptions']
  postcssPlugins?: SFCAsyncStyleCompileOptions['postcssPlugins']
  cssModulesOptions?: SFCAsyncStyleCompileOptions['modulesOptions']
  preprocessCustomRequire?: SFCAsyncStyleCompileOptions['preprocessCustomRequire']
  preprocessOptions?: SFCAsyncStyleCompileOptions['preprocessOptions']
}

const defaultOptions: Options = {
  include: /\.vue$/,
  exclude: [],
  vite: false,
  hmr: false,
  target: 'browser',
  exposeFilename: false,
  customBlocks: [],
}

export default function PluginVue(userOptions: Partial<Options> = {}): Plugin {
  const options: Options = {
    ...defaultOptions,
    ...userOptions,
  }

  if (options.vite) {
    options.preprocessStyles = false
  }

  const isServer = options.target === 'node'
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.BUILD === 'production'
  const rootContext = process.cwd()

  const filter = createFilter(options.include, options.exclude)
  const filterCustomBlock = createCustomBlockFilter(options.customBlocks)

  return {
    name: 'vue',
    async resolveId(id, importer) {
      const query = parseVuePartRequest(id)

      if (query.vue) {
        if (query.src) {
          const resolved = await this.resolve(query.filename, importer, {
            skipSelf: true,
          })
          if (resolved) {
            setDescriptor(resolved.id, getDescriptor(importer!))
            const [, originalQuery] = id.split('?', 2)
            resolved.id += `?${originalQuery}`
            return resolved
          }
        } else if (!filter(query.filename)) {
          return null
        }
        debug(`resolveId(${id})`)
        return id
      }
      return null
    },

    load(id) {
      const query = parseVuePartRequest(id)
      if (query.vue) {
        if (query.src) {
          return fs.readFileSync(query.filename, 'utf-8')
        }
        const descriptor = getDescriptor(query.filename)
        const block =
          query.type === 'template'
            ? descriptor.template!
            : query.type === 'script'
            ? getResolvedScript(descriptor, isServer)
            : query.type === 'style'
            ? descriptor.styles[query.index]
            : typeof query.index === 'number'
            ? descriptor.customBlocks[query.index]
            : null

        if (block) {
          return {
            code: block.content,
            map: normalizeSourceMap(block.map, id),
          }
        }
      }
      return null
    },

    async transform(code, id) {
      const query = parseVuePartRequest(id)

      // *.vue file
      // generate an entry module that imports the actual blocks of the SFC
      if (!query.vue && filter(id)) {
        debug(`transform SFC entry (${id})`)
        const output = await genSfcFacade(
          code,
          id,
          options,
          rootContext,
          isProduction,
          isServer,
          filterCustomBlock,
          this
        )
        if (output) {
          debug('SFC entry code:', '\n' + output.code + '\n')
        }
        return output
      }

      // sub request for blocks
      if (query.vue) {
        if (!query.src && !filter(query.filename)) {
          return null
        }
        if (query.src) {
          this.addWatchFile(query.filename)
        }
        if (query.type === 'template') {
          debug(`transform template (${id})`)
          return transformTemplateAsModule(code, id, options, query, this)
        } else if (query.type === 'style') {
          debug(`transform style (${id})`)
          return transformStyle(code, id, options, query, isProduction, this)
        }
      }
      return null
    },

    // @ts-ignore
    handleHotUpdate,
  }
}

// overwrite for cjs require('rollup-plugin-vue')() usage
module.exports = PluginVue
