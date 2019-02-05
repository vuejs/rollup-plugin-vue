import { Plugin } from 'rollup'

const pluginBabel = require('rollup-plugin-babel')
const pluginNodeResolve = require('rollup-plugin-node-resolve')
const pluginCommonJS = require('rollup-plugin-commonjs')
const pluginImage = require('rollup-plugin-url')
const pluginMarkdown = require('rollup-plugin-md')
const pluginTypescript = require('rollup-plugin-typescript')
const pluginReplace = require('rollup-plugin-replace')

export function pluginInline(filename: string, code: string): Plugin {
  return {
    name: 'inline',
    resolveId(id: string) {
      if (id === filename) return filename

      return null
    },
    load(id: string) {
      if (id === filename) return code

      return null
    }
  }
}

export const plugins = [
  pluginImage({ emitFiles: false }),
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
    resolveId(id: string): string | undefined {
      if (id === filename) return filename
    },
    load(id: string): string | undefined {
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
