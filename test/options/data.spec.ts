import vue, { VuePluginOptions } from '../../src'
import { pluginInline } from '../setup/plugins'
import { rollup } from 'rollup'

describe('data', () => {
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
          <style scoped>
          div {
            color: red;
          }
          </style>
        `
        ),
        vue({
          ...options,
          normalizer: 'vue-runtime-helpers/dist/normalize-component.mjs',
          styleInjector: 'vue-runtime-helpers/dist/inject-style/browser.mjs',
        })
      ]
    })
      .then(bundle => bundle.generate({ format: 'es' }))
      .then(generated => generated.output[0])
  }

  it('prefix', async () => {
    const { code } = await setup({
      data: {
        css: '/*! © 2019 Jane Doe */\n'
      }
    })

    expect(code).toEqual(expect.stringContaining('© 2019 Jane Doe'))
  })
})
