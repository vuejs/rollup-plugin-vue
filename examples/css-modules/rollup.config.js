import VuePlugin from 'rollup-plugin-vue'
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'

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
      resolve(),
      VuePlugin(),
      postcss({
        modules: {
          generateScopedName: '[local]___[hash:base64:5]',
        },
        include: /&module=.*\.css$/,
      }),
      postcss({ include: /(?<!&module=.*)\.css$/ }),
    ],
    external(id) {
      return /^(vue)$/.test(id)
    },
  },
]

export default config
