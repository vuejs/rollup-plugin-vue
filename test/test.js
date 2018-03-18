/* global describe, it */
const Plugin = require('../')

describe('Compile .vue files', () => {
  let plugin
  beforeEach(() => {
    plugin = Plugin()
  })

  it('should transform', async () => {
    const output = await plugin.transform(
      `<template><span>Hello World!</span></template>`,
      './foo.vue'
    )

    expect(output).toBeTruthy()
    expect(typeof output.code).toBe('string')
  })

  it('should resolve component parts', async () => {
    await plugin.transform(
      `
<template>
  <span>Hello World!</span>
</template>

<script>
  export default {}
</script>

<style>
  span { color: red }
</style>

<style scoped>
  span { font-size: 1rem }
</style>
      `,
      './foo.vue'
    )

    const template = await plugin.load('./foo.vue?{"type":"template"}#.html')
    const script = await plugin.load('./foo.vue?{"type":"script"}#.js')
    const style = await plugin.load('./foo.vue?{"type":"style","index":0}#.css')
    const styleScoped = await plugin.load(
      './foo.vue?{"type":"style","index":1}#.css'
    )

    expect(template.code).toEqual(
      expect.stringContaining('<span>Hello World!</span>')
    )
    expect(script.code).toEqual(expect.stringContaining('export default {}'))
    expect(style.code).toEqual(expect.stringContaining('span { color: red }'))
    expect(styleScoped.code).toEqual(
      expect.stringContaining('span { font-size: 1rem }')
    )
  })

  it('should use lang as detected type', async () => {
    await plugin.transform(
      `
<template lang="pug">
span
      | Hello World!
</template>

<script lang="ts">
export default {}
</script>

<style lang="scss">
span { color: red }
</style>
    `,
      './foo.vue'
    )

    const template = await plugin.load('./foo.vue?{"type":"template"}#.pug')
    const script = await plugin.load('./foo.vue?{"type":"script"}#.ts')
    const style = await plugin.load('./foo.vue?{"type":"style","index":0}#.css')

    expect(template.code).toEqual(expect.stringContaining('Hello World!'))
    expect(script.code).toEqual(expect.stringContaining('export default {}'))
    expect(style.code).toEqual(expect.stringContaining('span { color: red }'))
  })

  it('should resolve path from src', async () => {
    await plugin.transform(
      `
      <template src="./foo.html"></template>
      <script src="./foo.js"></script>
      <style src="./foo.css"></style>
      `,
      './bar/foo.vue'
    )

    const template = plugin.resolveId('./bar/foo.vue?{"type":"template"}#.html')
    const script = plugin.resolveId('./bar/foo.vue?{"type":"script"}#.js')
    const style = plugin.resolveId('./bar/foo.vue?{"type":"style","index":0}#.css')

    expect(template).toBe('./foo.html')
    expect(script).toBe('./foo.js')
    expect(style).toBe('./foo.css')
  })
})
