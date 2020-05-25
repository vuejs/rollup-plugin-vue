import PluginVue from './index'

describe('Rollup Plugin Vue', () => {
  describe('transform', () => {
    let transform: (code: string, fileName: string) => Promise<{ code: string }>
    beforeEach(() => {
      transform = PluginVue().transform as any
    })

    it('should transform <script> block', async () => {
      const { code } = await transform(
        `<script>export default {}</script>`,
        `example.vue`
      )

      expect(code).toEqual(
        expect.stringContaining(
          `import script from "example.vue?vue&type=script&lang.js"`
        )
      )
      expect(code).toEqual(
        expect.stringContaining(
          `export * from "example.vue?vue&type=script&lang.js"`
        )
      )
      expect(code).toEqual(expect.stringContaining(`export default script`))
    })

    it('should transform <script lang="ts"> block', async () => {
      const { code } = await transform(
        `<script lang="ts">export default {}</script>`,
        `example.vue`
      )

      expect(code).toEqual(
        expect.stringContaining(
          `import script from "example.vue?vue&type=script&lang.ts"`
        )
      )
      expect(code).toEqual(
        expect.stringContaining(
          `export * from "example.vue?vue&type=script&lang.ts"`
        )
      )
      expect(code).toEqual(expect.stringContaining(`export default script`))
    })

    it('should transform <template> block', async () => {
      const { code } = await transform(
        `<template><div /></template>`,
        `example.vue`
      )

      expect(code).toEqual(
        expect.stringContaining(
          `import { render } from "example.vue?vue&type=template&id=`
        )
      )
      expect(code).not.toEqual(expect.stringContaining(`lang.html`))
      expect(code).toEqual(expect.stringContaining(`script.render = render`))
    })

    it('should transform <template lang="pug"> block', async () => {
      const { code } = await transform(
        `<template>div</template>`,
        `example.vue`
      )
      expect(code).toEqual(
        expect.stringContaining(
          `import { render } from "example.vue?vue&type=template&id=`
        )
      )
      expect(code).not.toEqual(expect.stringContaining(`lang.pug`))
      expect(code).toEqual(expect.stringContaining(`script.render = render`))
    })
  })
})
