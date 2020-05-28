import VuePlugin from 'rollup-plugin-vue'
import { createFilter } from 'rollup-pluginutils'

export default [
  {
    input: 'src/App.vue',
    output: {
      file: 'dist/app.js',
      format: 'esm',
      sourcemap: 'inline',
    },
    plugins: [VuePlugin({ customBlocks: ['i18n'] }), VueI18N()],
    external: ['vue'],
  },
]

function VueI18N() {
  const filter = createFilter([/vue&type=i18n/])

  return {
    transform(code, id) {
      if (filter(id)) {
        return {
          code: `
          export default function i18n(component) {
            component.i18n = ${JSON.stringify(JSON.parse(code.trim()))}
          }`,
          map: null,
        }
      }
    },
  }
}
