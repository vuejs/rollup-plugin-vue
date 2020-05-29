import VuePlugin from 'rollup-plugin-vue'
import PostCSS from 'rollup-plugin-postcss'
import NodeResolve from '@rollup/plugin-node-resolve'

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
    input: 'src/App.vue',
    output: {
      file: 'dist/app.js',
      format: 'esm',
      sourcemap: 'inline',
    },
    plugins: [
      // Resolve packages from `node_modules` e.g. `style-inject` module
      // used by `rollup-plugin-postcss` to inline CSS.
      NodeResolve(),
      VuePlugin({
        // PostCSS-modules options for <style module> compilation
        cssModulesOptions: {
          generateScopedName: '[local]___[hash:base64:5]',
        },
      }),
      PostCSS(),
    ],
    external(id) {
      return /^(vue)$/.test(id)
    },
  },
]

export default config
