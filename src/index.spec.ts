import PluginVue from './index'

describe('Rollup Plugin Vue', () => {
  describe('transform', () => {
    let transform: (code: string, fileName: string) => Promise<{ code: string }>
    beforeEach(() => {
      transform = PluginVue({ customBlocks: ['*'] }).transform as any
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
          `import { render } from "example.vue?vue&type=template&id=063a7d4c&lang.js"`
        )
      )
      expect(code).toEqual(expect.stringContaining(`script.render = render`))
    })

    it('should transform <template lang="pug"> block', async () => {
      const { code } = await transform(
        `<template>div</template>`,
        `example.vue`
      )
      expect(code).toEqual(
        expect.stringContaining(
          `import { render } from "example.vue?vue&type=template&id=063a7d4c&lang.js"`
        )
      )
      expect(code).toEqual(expect.stringContaining(`script.render = render`))
    })

    it('should transform <style> block', async () => {
      const { code } = await transform(`<style>.foo {}</style>`, `example.vue`)
      expect(code).toEqual(
        expect.stringContaining(
          `import "example.vue?vue&type=style&index=0&id=063a7d4c&lang.css"`
        )
      )
    })

    it('should transform <style scoped> block', async () => {
      const { code } = await transform(
        `<style scoped>.foo {}</style>`,
        `example.vue`
      )
      expect(code).toEqual(
        expect.stringContaining(
          `import "example.vue?vue&type=style&index=0&id=063a7d4c&scoped=true&lang.css`
        )
      )
    })

    it('should transform <style module> block', async () => {
      const { code } = await transform(
        `<style module>.foo {}</style>`,
        `example.vue`
      )
      expect(code).toEqual(
        expect.stringContaining(
          `import "example.vue?vue&type=style&index=0&id=063a7d4c&lang.css`
        )
      )
      expect(code).toEqual(
        expect.stringContaining(
          `import style0 from "example.vue?vue&type=style&index=0&id=063a7d4c&module=true&lang.css`
        )
      )
      expect(code).toEqual(expect.stringContaining('script.__cssModules = {}'))
      expect(code).toEqual(
        expect.stringContaining('cssModules["$style"] = style0')
      )
    })

    it('should transform <style module="custom"> block', async () => {
      const { code } = await transform(
        `<style module="custom">.foo {}</style>`,
        `example.vue`
      )
      expect(code).toEqual(
        expect.stringContaining(
          `import "example.vue?vue&type=style&index=0&id=063a7d4c&lang.css`
        )
      )
      expect(code).toEqual(
        expect.stringContaining(
          `import style0 from "example.vue?vue&type=style&index=0&id=063a7d4c&module=custom&lang.css`
        )
      )
      expect(code).toEqual(expect.stringContaining('script.__cssModules = {}'))
      expect(code).toEqual(
        expect.stringContaining('cssModules["custom"] = style0')
      )
    })

    it.skip('should transform multiple <style module> block', async () => {
      await transform(
        `<style module>.foo {}</style>
         <style module>.bar {}</style>`,
        `example.vue`
      )
      // TODO: Maybe warn about duplicate css module?
    })

    it('should transform <i18n> block', async () => {
      const { code } = await transform(`<i18n>{}</i18n>`, `example.vue`)
      expect(code).toEqual(
        expect.stringContaining(
          `import block0 from "example.vue?vue&type=i18n&index=0&lang.i18n`
        )
      )
      expect(code).toEqual(expect.stringContaining('block0(script)'))
    })

    it('should transform <i18n lang="json"> block', async () => {
      const { code } = await transform(
        `<i18n lang="json">{}</i18n>`,
        `example.vue`
      )
      expect(code).toEqual(
        expect.stringContaining(
          `import block0 from "example.vue?vue&type=i18n&index=0&lang.json`
        )
      )
      expect(code).toEqual(expect.stringContaining('block0(script)'))
    })
  })
})
