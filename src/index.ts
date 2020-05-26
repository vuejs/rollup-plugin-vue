try {
  require.resolve('@vue/compiler-sfc')
} catch (e) {
  throw new Error(
    'rollup-plugin-vue requires @vue/compiler-sfc to be present in the dependency ' +
      'tree.'
  )
}

import {
  CompilerError,
  compileStyleAsync,
  compileTemplate,
  parse,
  SFCBlock,
  SFCDescriptor,
  SFCTemplateCompileOptions,
  SFCTemplateCompileResults,
  SFCStyleCompileOptions,
} from '@vue/compiler-sfc'
import fs from 'fs'
import createDebugger from 'debug'
import hash from 'hash-sum'
import { basename, relative, dirname, resolve } from 'path'
import qs from 'querystring'
import { Plugin, RollupError } from 'rollup'
import { createFilter } from 'rollup-pluginutils'

const debug = createDebugger('rollup-plugin-vue')

export interface Options
  extends Pick<
      SFCTemplateCompileOptions,
      'compiler' | 'compilerOptions' | 'transformAssetUrls'
    >,
    Pick<SFCStyleCompileOptions, 'preprocessCustomRequire'> {
  include: string | RegExp | (string | RegExp)[]
  exclude: string | RegExp | (string | RegExp)[]
  target: 'node' | 'browser'
  exposeFilename: boolean

  customBlocks?: string[]

  // if true, handle preprocessors directly instead of delegating to other
  // rollup plugins
  preprocessStyles?: boolean

  // TODO this will be exposed via SFCAsyncStyleCompileOptions which we forgot
  // to export in @vue/compiler-sfc
  cssModulesOptions?: {
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: string[]
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    localsConvention?: 'camelCase' | 'camelCaseOnly' | 'dashes' | 'dashesOnly'
  }
}

const defaultOptions: Options = {
  include: /\.vue$/,
  exclude: [],
  target: 'browser',
  exposeFilename: false,
  customBlocks: [],
}

export default function PluginVue(userOptions: Partial<Options> = {}): Plugin {
  const options: Options = {
    ...defaultOptions,
    ...userOptions,
  }

  const isServer = options.target === 'node'
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.BUILD === 'production'
  const rootContext = process.cwd()

  const filter = createFilter(options.include, options.exclude)
  const filterCustomBlock = createCustomBlockFilter(options.customBlocks)

  return {
    name: 'vue',
    resolveId(id, importer) {
      const query = parseVuePartRequest(id)

      if (query.vue) {
        if (query.src) {
          id = resolve(dirname(importer!), id)
          // map src request to the importer vue file descriptor
          const [filename] = id.split('?', 2)
          cache.set(filename, getDescriptor(importer!))
        }
        if (!filter(query.filename)) return undefined
        debug(`resolveId(${id})`)
        return id
      }
      return undefined
    },

    load(id) {
      const query = parseVuePartRequest(id)
      if (query.vue) {
        if (query.src) {
          return fs.readFileSync(query.filename, 'utf-8')
        }
        const descriptor = getDescriptor(query.filename)
        if (descriptor) {
          const block =
            query.type === 'template'
              ? descriptor.template!
              : query.type === 'script'
              ? descriptor.script!
              : query.type === 'style'
              ? descriptor.styles[query.index]
              : query.type === 'custom'
              ? descriptor.customBlocks[query.index]
              : null

          if (block) {
            return {
              code: block.content,
              map: normalizeSourceMap(block.map),
            }
          }
        }
      }

      return undefined
    },

    async transform(code, id) {
      const query = parseVuePartRequest(id)
      if (query.vue) {
        if (!filter(query.filename)) return null

        const descriptor = getDescriptor(query.filename)
        const hasScoped = descriptor.styles.some((s) => s.scoped)
        if (query.type === 'template') {
          debug(`transform(${id})`)
          const block = descriptor.template!
          const result = compileTemplate({
            filename: query.filename,
            source: code,
            inMap: query.src ? undefined : block.map,
            preprocessLang: block.lang,
            preprocessCustomRequire: options.preprocessCustomRequire,
            compiler: options.compiler,
            ssr: isServer,
            compilerOptions: {
              ...options.compilerOptions,
              scopeId: hasScoped ? `data-v-${query.id}` : undefined,
            },
            transformAssetUrls: options.transformAssetUrls,
          })

          if (result.errors.length) {
            result.errors.forEach((error) =>
              this.error(
                typeof error === 'string'
                  ? { id: query.filename, message: error }
                  : createRollupError(query.filename, error)
              )
            )
            return null
          }

          if (result.tips.length) {
            result.tips.forEach((tip) =>
              this.warn({
                id: query.filename,
                message: tip,
              })
            )
          }

          return {
            code: result.code,
            map: normalizeSourceMap(result.map!),
          }
        } else if (query.type === 'style') {
          debug(`transform(${id})`)
          const block = descriptor.styles[query.index]!
          const result = await compileStyleAsync({
            filename: query.filename,
            id: `data-v-${query.id!}`,
            source: code,
            scoped: block.scoped,
            modules: !!block.module,
            modulesOptions: options.cssModulesOptions,
            preprocessLang: options.preprocessStyles
              ? (block.lang as any)
              : undefined,
            preprocessCustomRequire: options.preprocessCustomRequire,
          })

          if (result.errors.length) {
            result.errors.forEach((error) =>
              this.error({
                id: query.filename,
                message: error.message,
              })
            )
            return null
          }

          if (query.module) {
            return {
              code: `export default ${_(result.modules)}`,
              map: null,
            }
          } else {
            return {
              code: result.code,
              map: normalizeSourceMap(result.map!),
            }
          }
        }
        return null
      } else if (filter(id)) {
        debug(`transform(${id})`)
        const { descriptor, errors } = parseSFC(code, id, rootContext)

        if (errors.length) {
          errors.forEach((error) => this.error(createRollupError(id, error)))
          return null
        }

        // module id for scoped CSS & hot-reload
        const output = transformVueSFC(
          code,
          id,
          descriptor,
          { rootContext, isProduction, isServer, filterCustomBlock },
          options
        )
        debug('transient .vue file:', '\n' + output + '\n')

        return {
          code: output,
          map: {
            mappings: '',
          },
        }
      } else {
        return null
      }
    },
  }
}

function createCustomBlockFilter(
  queries?: string[]
): (type: string) => boolean {
  if (!queries || queries.length === 0) return () => false

  const allowed = new Set(queries.filter((query) => /^[a-z]/i.test(query)))
  const disallowed = new Set(
    queries
      .filter((query) => /^![a-z]/i.test(query))
      .map((query) => query.substr(1))
  )
  const allowAll = queries.includes('*') || !queries.includes('!*')

  return (type: string) => {
    if (allowed.has(type)) return true
    if (disallowed.has(type)) return true

    return allowAll
  }
}

type Query =
  | {
      filename: string
      vue: false
    }
  | {
      filename: string
      vue: true
      type: 'script'
      src?: true
    }
  | {
      filename: string
      vue: true
      type: 'template'
      id?: string
      src?: true
    }
  | {
      filename: string
      vue: true
      type: 'style'
      index: number
      id?: string
      scoped?: boolean
      module?: string | boolean
      src?: true
    }
  | {
      filename: string
      vue: true
      type: 'custom'
      index: number
      src?: true
    }

function parseVuePartRequest(id: string): Query {
  const [filename, query] = id.split('?', 2)

  if (!query) return { vue: false, filename }

  const raw = qs.parse(query)

  if ('vue' in raw) {
    return {
      ...raw,
      filename,
      vue: true,
      index: Number(raw.index),
      src: 'src' in raw,
      scoped: 'scoped' in raw,
    } as any
  }

  return { vue: false, filename }
}

const cache = new Map<string, SFCDescriptor>()

function getDescriptor(id: string) {
  if (cache.has(id)) {
    return cache.get(id)!
  }

  throw new Error(`${id} is not parsed yet`)
}

function parseSFC(
  code: string,
  id: string,
  sourceRoot: string
): { descriptor: SFCDescriptor; errors: CompilerError[] } {
  const { descriptor, errors } = parse(code, {
    sourceMap: true,
    filename: id,
    sourceRoot: sourceRoot,
    pad: 'line',
  })

  cache.set(id, descriptor)

  return { descriptor, errors }
}

function transformVueSFC(
  code: string,
  resourcePath: string,
  descriptor: SFCDescriptor,
  {
    rootContext,
    isProduction,
    isServer,
    filterCustomBlock,
  }: {
    rootContext: string
    isProduction: boolean
    isServer: boolean
    filterCustomBlock: (type: string) => boolean
  },
  options: Options
) {
  const shortFilePath = relative(rootContext, resourcePath)
    .replace(/^(\.\.[\/\\])+/, '')
    .replace(/\\/g, '/')
  const id = hash(isProduction ? shortFilePath + '\n' + code : shortFilePath)
  // feature information
  const hasScoped = descriptor.styles.some((s) => s.scoped)
  const templateImport = getTemplateCode(
    descriptor,
    resourcePath,
    id,
    hasScoped,
    isServer
  )
  const scriptImport = getScriptCode(descriptor, resourcePath)
  const stylesCode = getStyleCode(
    descriptor,
    resourcePath,
    id,
    options.preprocessStyles
  )
  const customBlocksCode = getCustomBlock(
    descriptor,
    resourcePath,
    filterCustomBlock
  )
  const output = [
    scriptImport,
    templateImport,
    stylesCode,
    customBlocksCode,
    isServer ? `script.ssrRender = ssrRender` : `script.render = render`,
  ]
  if (hasScoped) {
    output.push(`script.__scopeId = ${_(`data-v-${id}`)}`)
  }
  if (!isProduction) {
    output.push(`script.__file = ${_(shortFilePath)}`)
  } else if (options.exposeFilename) {
    output.push(`script.__file = ${_(basename(shortFilePath))}`)
  }
  output.push('export default script')
  return output.join('\n')
}

function getTemplateCode(
  descriptor: SFCDescriptor,
  resourcePath: string,
  id: string,
  hasScoped: boolean,
  isServer: boolean
) {
  let templateImport = `const render = () => {}`
  let templateRequest
  if (descriptor.template) {
    const src = descriptor.template.src || resourcePath
    const idQuery = `&id=${id}`
    const scopedQuery = hasScoped ? `&scoped=true` : ``
    const srcQuery = descriptor.template.src ? `&src` : ``
    const attrsQuery = attrsToQuery(descriptor.template.attrs)
    const query = `?vue&type=template${idQuery}${srcQuery}${scopedQuery}${attrsQuery}`
    templateRequest = _(src + query)
    templateImport = `import { ${
      isServer ? 'ssrRender' : 'render'
    } } from ${templateRequest}`
  }

  return templateImport
}

function getScriptCode(descriptor: SFCDescriptor, resourcePath: string) {
  let scriptImport = `const script = {}`
  if (descriptor.script) {
    const src = descriptor.script.src || resourcePath
    const attrsQuery = attrsToQuery(descriptor.script.attrs, 'js')
    const srcQuery = descriptor.script.src ? `&src` : ``
    const query = `?vue&type=script${srcQuery}${attrsQuery}`
    const scriptRequest = _(src + query)
    scriptImport =
      `import script from ${scriptRequest}\n` + `export * from ${scriptRequest}` // support named exports
  }
  return scriptImport
}

function getStyleCode(
  descriptor: SFCDescriptor,
  resourcePath: string,
  id: string,
  preprocessStyles?: boolean
) {
  let stylesCode = ``
  let hasCSSModules = false
  if (descriptor.styles.length) {
    descriptor.styles.forEach((style, i) => {
      const src = style.src || resourcePath
      // do not include module in default query, since we use it to indicate
      // that the module needs to export the modules json
      const attrsQuery = attrsToQuery(style.attrs, 'css', preprocessStyles)
      const attrsQueryWithoutModule = attrsQuery.replace(
        /&module(=true|=[^&]+)?/,
        ''
      )
      // make sure to only pass id when necessary so that we don't inject
      // duplicate tags when multiple components import the same css file
      const idQuery = style.scoped ? `&id=${id}` : ``
      const srcQuery = style.src ? `&src` : ``
      const query = `?vue&type=style&index=${i}${srcQuery}${idQuery}`
      const styleRequest = src + query + attrsQuery
      const styleRequestWithoutModule = src + query + attrsQueryWithoutModule
      if (style.module) {
        if (!hasCSSModules) {
          stylesCode += `\nconst cssModules = script.__cssModules = {}`
          hasCSSModules = true
        }
        stylesCode += genCSSModulesCode(
          id,
          i,
          styleRequest,
          styleRequestWithoutModule,
          style.module
        )
      } else {
        stylesCode += `\nimport ${_(styleRequest)}`
      }
      // TODO SSR critical CSS collection
    })
  }
  return stylesCode
}

function getCustomBlock(
  descriptor: SFCDescriptor,
  resourcePath: string,
  filter: (type: string) => boolean
) {
  let code = ''

  descriptor.customBlocks.forEach((block, index) => {
    if (filter(block.type)) {
      const src = block.src || resourcePath
      const attrsQuery = attrsToQuery(block.attrs, block.type)
      const srcQuery = block.src ? `&src` : ``
      const query = `?vue&type=${block.type}&index=${index}${srcQuery}${attrsQuery}`
      const request = _(src + query)
      code += `import block${index} from ${request}\n`
      code += `if (typeof block${index} === 'function') block${index}(script)\n`
    }
  })

  return code
}

function createRollupError(id: string, error: CompilerError): RollupError {
  return {
    id,
    plugin: 'vue',
    pluginCode: String(error.code),
    message: error.message,
    frame: error.loc!.source,
    parserError: error,
    loc: error.loc
      ? {
          file: id,
          line: error.loc.start.line,
          column: error.loc.start.column,
        }
      : undefined,
  }
}

// these are built-in query parameters so should be ignored
// if the user happen to add them as attrs
const ignoreList = ['id', 'index', 'src', 'type', 'lang']

function attrsToQuery(
  attrs: SFCBlock['attrs'],
  langFallback?: string,
  forceLangFallback = false
): string {
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (!ignoreList.includes(name)) {
      query += `&${qs.escape(name)}${
        value ? `=${qs.escape(String(value))}` : ``
      }`
    }
  }
  if (langFallback || attrs.lang) {
    query +=
      `lang` in attrs
        ? forceLangFallback
          ? `&lang.${langFallback}`
          : `&lang.${attrs.lang}`
        : `&lang.${langFallback}`
  }
  return query
}

function _(any: any) {
  return JSON.stringify(any)
}

function normalizeSourceMap(map: SFCTemplateCompileResults['map']): any {
  if (!map) return null as any

  return {
    ...map,
    version: Number(map.version),
    mappings: typeof map.mappings === 'string' ? map.mappings : '',
  }
}

function genCSSModulesCode(
  // @ts-ignore
  id: string,
  index: number,
  request: string,
  requestWithoutModule: string,
  moduleName: string | boolean
): string {
  const styleVar = `style${index}`
  let code =
    // first import the CSS for extraction
    `\nimport ${_(requestWithoutModule)}` +
    // then import the json file to expose to component...
    `\nimport ${styleVar} from ${_(request + '.js')}`

  // inject variable
  const name = typeof moduleName === 'string' ? moduleName : '$style'
  code += `\ncssModules["${name}"] = ${styleVar}`
  return code
}

// overwrite for cjs require('rollup-plugin-vue')() usage
module.exports = PluginVue
