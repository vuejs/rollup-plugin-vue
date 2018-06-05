import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript'

export default {
  input: 'src/MyComponent.vue',
  output: {
    format: 'esm',
    file: 'dist/MyComponent.js'
  },
  external: ['vue'],
  plugins: [
    typescript({
      tsconfig: false,
      experimentalDecorators: true,
      module: 'es2015'
    }),
    vue()
  ]
}
