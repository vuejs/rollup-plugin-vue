// Simple rollup config file.

const vue = require('../dist/rollup-plugin-vue.common.js');

export default {
    plugins: [ vue() ],
};
