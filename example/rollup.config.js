// Simple rollup config file.

const vue = require('../dist/rollup-plugin-vue.common.js')
const buble = require('rollup-plugin-buble')
// const prepack = require('rollup-plugin-prepack')
// const closure = require('rollup-plugin-closure-compiler-js')
const node = require('rollup-plugin-node-resolve')
// const commonjs = require('rollup-plugin-commonjs')
export default {
  name: 'ff',
  input: 'index.js',
  format: 'es',
  plugins: [vue(), buble()],
  external: [
    'vue-component-compiler/src/runtime/normalize-component',
    'vue-component-compiler/src/runtime/inject-style-client'
  ]
}
