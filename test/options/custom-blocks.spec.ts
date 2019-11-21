import vue, { VuePluginOptions } from '../../src'
import { pluginInline } from '../setup/plugins'
import { rollup } from 'rollup'
function pluginText() {
  return {
    name: 'text',
    transform(source: string, id: string) {
      if (/\.(md|txt)$/.test(id)) {
        return `export default ${JSON.stringify(source.trim())}`
      }
    },
  }
}

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
        pluginText(),
        vue({
          ...options,
          defaultLang: {
            docs: 'md',
            custom: 'txt',
          },
          normalizer: 'vue-runtime-helpers/dist/normalize-component.mjs',
        }),
      ],
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
      customBlocks: ['custom'],
    })

    expect(code).toEqual(expect.stringContaining('My Custom Block'))
    expect(code).not.toEqual(expect.stringContaining('My Docs Block'))
  })
  it('negative array of tags', async () => {
    const { code } = await setup({
      customBlocks: ['*', '!custom'],
    })

    expect(code).not.toEqual(expect.stringContaining('My Custom Block'))
    expect(code).toEqual(expect.stringContaining('My Docs Block'))
  })
  it('function', async () => {
    const { code } = await setup({
      customBlocks(tag) {
        return tag === 'custom'
      },
    })

    expect(code).toEqual(expect.stringContaining('My Custom Block'))
    expect(code).not.toEqual(expect.stringContaining('My Docs Block'))
  })

  it('transform', async () => {
    const { code } = await setup({
      customBlocks: ['docs'],
    })

    expect(code).toEqual(expect.stringContaining('__custom_block_1__(__vue_component__)'))
    expect(code).toMatchSnapshot()
  })
})
