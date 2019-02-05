import pluginVue from '../src'

describe('forward-style-compiler-errors', () => {
  it('throws', async () => {
    let plugin = pluginVue()
    await expect(
      (plugin as any).transform(
        `
        <template>
        <div>Hello, world</div>
        </template>
        <style lang="scss">
        @import 'file-not-exits.scss';
        </style>
        `,
        'virtual-file.vue'
      )
    ).rejects.toBeInstanceOf(Error)
  })
})
