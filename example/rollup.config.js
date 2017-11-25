// Simple rollup config file.

const vue = require('../dist/rollup-plugin-vue.common.js');
const buble = require('rollup-plugin-buble');

export default {
  name: 'helloRollupVue',
  output: {
    file: 'dist/bundle.js',
    format: 'umd'
  },
  plugins: [
    vue({
      compileTemplate: true,
      css: 'dist/bundle.css'
    }),
    buble()
  ]
};
