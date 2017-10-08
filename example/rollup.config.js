// Simple rollup config file.

const vue = require('../dist/rollup-plugin-vue.common.js')
const buble = require('rollup-plugin-buble')
// const prepack = require('rollup-plugin-prepack')
// const closure = require('rollup-plugin-closure-compiler-js')
const node = require('rollup-plugin-node-resolve')
// const commonjs = require('rollup-plugin-commonjs')

process.env.NODE_ENV = 'production'

export default {
  name: 'ff',
  input: 'index.js',
  format: 'es',
  plugins: [vue(), buble()]
}
