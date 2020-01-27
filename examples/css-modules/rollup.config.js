import vue from '../../dist/rollup-plugin-vue.esm'
import postcss from 'rollup-plugin-postcss'

export default [
  {
    input: 'src/App.vue',
    output: {
      file: 'dist/app.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      vue(),
      postcss({
        modules: {
          generateScopedName: '[local]___[hash:base64:5]',
        },
        include: /&module=.*\.css$/,
      }),
      postcss({ include: /(?<!&module=.*)\.css$/ }),
    ],
    external: ['vue'],
  },
]
