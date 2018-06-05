import vue from 'rollup-plugin-vue'

export default {
  input: 'src/MyComponent.vue',
  output: {
    format: 'esm',
    file: 'dist/MyComponent.js'
  },
  plugins: [
    vue({ template: { optimizeSSR: true } })
  ]
}
