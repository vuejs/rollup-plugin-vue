import vue, { VuePluginOptions } from '../../src'
import { pluginInline } from '../setup/plugins'
import { rollup } from 'rollup'

describe('customBlocks', () => {
  async function setup(options?: Partial<VuePluginOptions>) {
    return rollup({
      input: '/entry.vue',
      plugins: [
        pluginInline(
          '/entry.vue',
          `
        <template>
        <div>Hello, world</div>
        </template>
        <custom>
        // My Custom Block
        </custom>
        <docs>
        // My Docs Block
        </docs>
      `
        ),
        vue({
          ...options,
          normalizer: 'vue-runtime-helpers/dist/normalize-component.mjs'
        })
      ]
    })
      .then(bundle => bundle.generate({ format: 'es' }))
      .then(generated => generated.output[0])
  }

  it('default', async () => {
    const { code } = await setup()

    expect(code).not.toEqual(expect.stringContaining('My Custom Block'))
    expect(code).not.toEqual(expect.stringContaining('My Docs Block'))
  })

  it('array of tags', async () => {
    const { code } = await setup({
      customBlocks: ['custom']
    })

    expect(code).toEqual(expect.stringContaining('My Custom Block'))
    expect(code).not.toEqual(expect.stringContaining('My Docs Block'))
  })
  it('negative array of tags', async () => {
    const { code } = await setup({
      customBlocks: ['*', '!custom']
    })

    expect(code).not.toEqual(expect.stringContaining('My Custom Block'))
    expect(code).toEqual(expect.stringContaining('My Docs Block'))
  })
  it('function', async () => {
    const { code } = await setup({
      customBlocks(tag) {
        return tag === 'custom'
      }
    })

    expect(code).toEqual(expect.stringContaining('My Custom Block'))
    expect(code).not.toEqual(expect.stringContaining('My Docs Block'))
  })
})
