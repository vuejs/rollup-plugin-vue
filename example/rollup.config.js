// Simple rollup config file.

const vue = require('../dist/rollup-plugin-vue.common.js');
const buble = require('rollup-plugin-buble');
export default {
    plugins: [ vue({compileTemplate: true}), buble() ],
};
