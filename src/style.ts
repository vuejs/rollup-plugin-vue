import {
  compileStyleAsync,
  SFCAsyncStyleCompileOptions,
} from '@vue/compiler-sfc'
import { TransformPluginContext } from 'rollup'
import { Options } from '.'
import { getDescriptor } from './utils/descriptorCache'
import { StyleBlockQuery } from './utils/query'
import { normalizeSourceMap } from './utils/sourceMap'

export async function transformStyle(
  code: string,
  request: string,
  options: Options,
  query: StyleBlockQuery,
  isProduction: boolean,
  pluginContext: TransformPluginContext
) {
  const descriptor = getDescriptor(query.filename)
  const block = descriptor.styles[query.index]!

  let preprocessOptions = options.preprocessOptions || {}
  const preprocessLang = (options.preprocessStyles && !options.vite
    ? block.lang
    : undefined) as SFCAsyncStyleCompileOptions['preprocessLang']

  if (preprocessLang) {
    preprocessOptions = preprocessOptions[preprocessLang] || preprocessOptions
    // include node_modules for imports by default
    switch (preprocessLang) {
      case 'scss':
      case 'sass':
        preprocessOptions = {
          includePaths: ['node_modules'],
          ...preprocessOptions,
        }
        break
      case 'less':
      case 'stylus':
        preprocessOptions = {
          paths: ['node_modules'],
          ...preprocessOptions,
        }
    }
  } else {
    preprocessOptions = {}
  }

  const result = await compileStyleAsync({
    filename: query.filename,
    id: `data-v-${query.id}`,
    isProd: isProduction,
    source: code,
    scoped: block.scoped,
    // vite handle CSS modules
    modules: !!block.module && !options.vite,
    postcssOptions: options.postcssOptions,
    postcssPlugins: options.postcssPlugins,
    modulesOptions: options.cssModulesOptions,
    preprocessLang,
    preprocessCustomRequire: options.preprocessCustomRequire,
    preprocessOptions,
  })

  if (result.errors.length) {
    result.errors.forEach((error: any) => {
      if (error.line && error.column) {
        error.loc = {
          file: query.filename,
          line: error.line + block.loc.start.line,
          column: error.column,
        }
      }
      pluginContext.error(error)
    })
    return null
  }

  if (query.module && !options.vite) {
    // vite handles css modules code generation down the stream
    return {
      code: `export default ${JSON.stringify(result.modules)}`,
      map: null,
    }
  } else {
    return {
      code: result.code,
      map: normalizeSourceMap(result.map!, request),
    }
  }
}
