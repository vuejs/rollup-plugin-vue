import vue from '../../dist/rollup-plugin-vue.esm'

export default [{
  input: 'src/App.vue',
  output: {
    file: 'dist/app.js',
    format: 'esm',
    sourcemap: 'inline',
  },
  plugins: [vue()],
  external: ['vue']
}]
