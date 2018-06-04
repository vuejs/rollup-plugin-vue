import vue from 'rollup-plugin-vue'

export default {
  input: 'src/MyComponent.vue',
  output: {
    format: 'esm',
    file: 'dist/my-component.esm.js'
  },
  plugins: [
    vue()
  ]
}
