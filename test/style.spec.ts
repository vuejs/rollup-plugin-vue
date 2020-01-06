import vue from '../src'
import { rollup, Plugin } from 'rollup'
import { createFilter } from 'rollup-pluginutils'
import { pluginInline } from './setup/plugins'

function dummyScssPlugin(): Plugin {
  const filter = createFilter([/\.scss$/], [])

  return {
    name: 'scss',
    transform(code: string, id: string) {
      if (filter(id)) {
        return `/* processed with scss */\n${code}`
      }
    },
  }
}

describe('forward-style-compiler-errors', () => {
  it('throws', async () => {
    let plugin = vue()
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

  it('processes scss with rollup', async () => {
    const bundle = await rollup({
      input: 'component.vue',
      plugins: [pluginInline('component.vue', 
        `<template>
            <div>Hello World</div>
         </template>
         <style lang="scss">
         div { color: red }
         </style>
        `
      ), dummyScssPlugin(), vue()],
    })

    const result = await bundle.generate({ format: 'esm', sourcemap: false })

    result.output
  })
})
