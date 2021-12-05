import { getDescriptor } from './utils/descriptorCache'
import { compileStyle } from '@vue/component-compiler-utils'
import { PluginContext } from 'rollup'
import { VuePluginOptions } from './interface'

export function transformStyle(
  source: string,
  filename: string,
  id: string,
  index: number,
  options: VuePluginOptions,
  pluginContext: PluginContext
) {
  const descriptor = getDescriptor(filename)
  const block = descriptor.styles[index]

  const { code, errors } = compileStyle({
    source,
    filename,
    id: `data-v-${id}`,
    ...options.style,
    scoped: !!block.scoped,
    trim: true,
  })

  if (errors.length) {
    errors.forEach(error => {
      pluginContext.error({ id: filename, message: error })
    })
  }

  return {
    code,
    map: block.map,
  }
}
