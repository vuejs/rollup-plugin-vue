try {
  require.resolve('@vue/compiler-sfc')
} catch (e) {
  throw new Error(
    'vue-loader requires @vue/compiler-sfc to be present in the dependency ' +
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
} from '@vue/compiler-sfc'
// @ts-ignore
import createDebugger from 'debug'
import hash from 'hash-sum'
import { basename, relative } from 'path'
import qs from 'querystring'
import { Plugin, RollupError } from 'rollup'
import { createFilter } from 'rollup-pluginutils'
import { genCSSModulesCode } from './cssModules'

const debug = createDebugger('rollup-plugin-vue')

export interface Options
  extends Pick<
    SFCTemplateCompileOptions,
    'compiler' | 'compilerOptions' | 'transformAssetUrls'
  > {
  include: string | RegExp | (string | RegExp)[]
  exclude: string | RegExp | (string | RegExp)[]
  target: 'node' | 'browser'
  exposeFilename: boolean
}

const defaultOptions: Options = {
  include: /\.vue$/,
  exclude: [],
  target: 'browser',
  exposeFilename: false,
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

  return {
    name: 'vue',
    resolveId(id) {
      const query = parseVuePartRequest(id)

      if (query.vue) {
        debug(`resolveId(${id})`)

        return id
      }

      return undefined
    },
    load(id) {
      debug(`load(${id})`)
      const query = parseVuePartRequest(id)

      if (query.vue) {
        const descriptor = getDescriptor(query.filename)

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
            map: normalizeSourceMap(block.map, 'load:' + id)
          }
        }
      }

      return undefined
    },
    async transform(code, id) {
      debug(`transform(${id})`)
      const query = parseVuePartRequest(id)
      if (query.vue) {
        const descriptor = getDescriptor(query.filename)
        if (query.type === 'template') {
          const block = descriptor.template!
          const result = compileTemplate({
            filename: query.filename,
            source: block.content,
            preprocessLang: block.lang,
            inMap: normalizeSourceMap(block.map!, 'transform:' + id),
            compiler: options.compiler,
            compilerOptions: options.compilerOptions,
            transformAssetUrls: options.transformAssetUrls,
          })

          if (result.errors.length) {
            result.errors.forEach(error =>
              this.error(
                typeof error === 'string'
                  ? { id: query.filename, message: error }
                  : createRollupError(query.filename, error)
              )
            )
            return null
          }

          if (result.tips.length) {
            result.tips.forEach(tip =>
              this.warn({
                id: query.filename,
                message: tip,
              })
            )
          }

          return {
            code: result.code,
            map: normalizeSourceMap(result.map!, id),
          }
        } else if (query.type === 'style' && query.scoped) {
          const block = descriptor.styles[query.index]!
          const result = await compileStyleAsync({
            filename: query.filename,
            id: `data-v-${query.id!}`,
            source: block.content,
            scoped: query.scoped,
            trim: true,
          })

          if (result.errors.length) {
            result.errors.forEach(error =>
              this.error({
                id: query.filename,
                message: error.message,
              })
            )
            return null
          }

          return {
            code: result.code,
            map: normalizeSourceMap(result.map!, id),
          }
        }
        return null
      } else if (filter(id)) {
        const { descriptor, errors } = parseSFC(code, id, rootContext)

        if (errors.length) {
          errors.forEach(error => this.error(createRollupError(id, error)))
          return null
        }

        // module id for scoped CSS & hot-reload
        const output = transformVueSFC(
          code,
          id,
          descriptor,
          { rootContext, isProduction, isServer },
          options
        )

        return {
          code: output,
          map: null,
        }
      } else {
        return null
      }
    },
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
      type: 'script' | 'template'
    }
  | {
      filename: string
      vue: true
      type: 'style'
      index: number
      id?: string
      scoped?: boolean
      module?: string | boolean
    }
  | {
      filename: string
      vue: true
      type: 'custom'
      index: number
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
      type: raw.type,
      index: Number(raw.index),
      scoped: 'scoped' in raw,
      module: raw.module,
    } as any
  }

  return { vue: false, filename }
}

const cache = new Map<string, SFCDescriptor>()

function getDescriptor(id: string) {
  if (cache.has(id)) {
    return cache.get(id)!
  }

  throw new Error(`${id} is not parsed it yet`)
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
  }: { rootContext: string; isProduction: boolean; isServer: boolean },
  options: Options
) {
  const shortFilePath = relative(rootContext, resourcePath)
    .replace(/^(\.\.[\/\\])+/, '')
    .replace(/\\/g, '/')
  const id = hash(isProduction ? shortFilePath + '\n' + code : shortFilePath)
  // feature information
  const hasScoped = descriptor.styles.some(s => s.scoped)
  const templateImport = getTemplateCode(
    descriptor,
    resourcePath,
    id,
    hasScoped
  )
  const scriptImport = getScriptCode(descriptor, resourcePath)
  const stylesCode = getStyleCode(descriptor, resourcePath, id)
  const output = [
    templateImport,
    scriptImport,
    stylesCode,
    `script.render = render`,
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
  hasScoped: boolean
) {
  let templateImport = `const render = () => {}`
  let templateRequest
  if (descriptor.template) {
    const src = descriptor.template.src || resourcePath
    const idQuery = `&id=${id}`
    const scopedQuery = hasScoped ? `&scoped=true` : ``
    const attrsQuery = attrsToQuery(descriptor.template.attrs)
    const query = `?vue&type=template${idQuery}${scopedQuery}${attrsQuery}`
    templateRequest = _(src + query)
    templateImport = `import { render } from ${templateRequest}`
  }

  return templateImport
}

function getScriptCode(descriptor: SFCDescriptor, resourcePath: string) {
  let scriptImport = `const script = {}`
  if (descriptor.script) {
    const src = descriptor.script.src || resourcePath
    const attrsQuery = attrsToQuery(descriptor.script.attrs, 'js')
    const query = `?vue&type=script${attrsQuery}`
    const scriptRequest = _(src + query)
    scriptImport =
      `import script from ${scriptRequest}\n` + `export * from ${scriptRequest}` // support named exports
  }
  return scriptImport
}

function getStyleCode(
  descriptor: SFCDescriptor,
  resourcePath: string,
  id: string
) {
  let stylesCode = ``
  let hasCSSModules = false
  if (descriptor.styles.length) {
    descriptor.styles.forEach((style, i) => {
      const src = style.src || resourcePath
      const attrsQuery = attrsToQuery(style.attrs, 'css')
      // make sure to only pass id when necessary so that we don't inject
      // duplicate tags when multiple components import the same css file
      const idQuery = style.scoped ? `&id=${id}` : ``
      const query = `?vue&type=style&index=${i}${idQuery}${attrsQuery}`
      const styleRequest = _(src + query)
      if (style.module) {
        if (!hasCSSModules) {
          stylesCode += `const cssModules = script.__cssModules = {}`
          hasCSSModules = true
        }
        stylesCode += genCSSModulesCode(id, i, styleRequest, style.module)
      } else {
        stylesCode += `\nimport ${styleRequest}`
      }
      // TODO SSR critical CSS collection
    })
  }
  return stylesCode
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
const ignoreList = ['id', 'index', 'src', 'type']
function attrsToQuery(attrs: SFCBlock['attrs'], langFallback?: string): string {
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (!ignoreList.includes(name)) {
      query += `&${qs.escape(name)}=${value ? qs.escape(String(value)) : ``}`
    }
  }
  if (langFallback && !(`lang` in attrs)) {
    query += `&lang.${langFallback}`
  }
  return query
}

function _(any: any) {
  return JSON.stringify(any)
}

function normalizeSourceMap(map: SFCTemplateCompileResults['map'], extra?: any): any {
  if (!map) return null as any

  if (typeof map.mappings !== 'string') {
    console.log(extra, map)
  }

  return {
    version: Number(map.version),
    file: map.file,
    names: map.names,
    sources: map.sources,
    sourceRoot: map.sourceRoot,
    sourcesContent: map.sourcesContent,
    mappings: typeof map.mappings === 'string' ? map.mappings : '',
  }
}
