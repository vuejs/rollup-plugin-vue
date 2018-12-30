const pluginBabel = require('rollup-plugin-babel')
const pluginNodeResolve = require('rollup-plugin-node-resolve')
const pluginCommonJS = require('rollup-plugin-commonjs')
const pluginImage = require('rollup-plugin-url')
const pluginMarkdown = require('rollup-plugin-md')
const pluginTypescript = require('rollup-plugin-typescript')
const pluginReplace = require('rollup-plugin-replace')
const path = require('path')

export const plugins = [
  pluginImage(),
  pluginMarkdown(),
  pluginNodeResolve(),
  pluginCommonJS(),
  pluginReplace({ 'process.env.NODE_ENV': '"production"' }),
  pluginTypescript({
    tsconfig: false,
    experimentalDecorators: true,
    module: 'es2015'
  }),
  pluginBabel({
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: false,
          targets: {
            browsers: ['last 2 versions']
          }
        }
      ]
    ],
    babelrc: false,
    runtimeHelpers: true
  })
]

export function pluginCreateVueApp(filename: string, component: string): any {
  return {
    name: 'Inline',
    resolveId(id) {
      if (id === filename) return filename
    },
    load(id) {
      if (id === filename)
        return `
    import Component from ${JSON.stringify(component)}

    Vue.config.productionTip = false
    Vue.config.devtools = false

    new Vue({
      el: '#app',
      render (h) {
        return h(Component)
      }
    })
  `
    }
  }
}
