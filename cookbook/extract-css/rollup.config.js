import vue from 'rollup-plugin-vue'
import css from 'rollup-plugin-css-only'

export default {
  input: 'src/MyComponent.vue',
  output: {
    format: 'esm',
    file: 'dist/MyComponent.js'
  },
  plugins: [
    css(),
    vue({ css: false })
  ]
}
