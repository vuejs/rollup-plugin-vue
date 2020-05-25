import VuePlugin from 'rollup-plugin-vue'
import postcss from 'rollup-plugin-postcss'

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
      return /(^vue$|style-inject)/.test(id)
    },
  },
]

export default config
