const pluginBabel = require('rollup-plugin-babel')
const pluginNodeResolve = require('rollup-plugin-node-resolve')
const pluginImage = require('rollup-plugin-image')
const pluginMarkdown = require('rollup-plugin-md')

export const plugins = [
  pluginImage(),
  pluginMarkdown(),
  pluginNodeResolve(),
  pluginBabel({
    presets: [
      [require.resolve('@babel/preset-env'), {
        modules: false,
        targets: {
          browsers: ['last 2 versions']
        }
      }]
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
      if (id === filename) return `
    import Component from '${component}'

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