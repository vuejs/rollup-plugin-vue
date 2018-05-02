const { rollup } = require('rollup')
const babel = require('rollup-plugin-babel')
// const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const image = require('rollup-plugin-image')
const { readFileSync } = require('fs')
const { resolve } = require('path')
const md = require('rollup-plugin-md')
const vue = require('../..')

module.exports = { build, open }

function inline(filename, code) {
  return {
    name: 'Inline',
    resolveId(id) {
      if (id === filename) return filename
    },
    load(id) {
      if (id === filename) return code
    }
  }
}
const babelIt = babel({
  presets: [[require.resolve('@babel/preset-env'), { modules: false }]],
  // plugins: ['external-helpers'],
  babelrc: false,
  runtimeHelpers: true
})

const cache = {}

async function build(filename) {
  const cacheKey = filename
  if (cacheKey in cache) return cache[cacheKey]
  const input = filename + '__app.js'

  const options = { defaultLang: { markdown: 'md' } }
  let bundle = await rollup({
    input,
    plugins: [
      md(),
      vue(options),
      image(),
      nodeResolve(),
      inline(
        input,
        `
        import Component from '${filename}'

        Vue.config.productionTip = false
        Vue.config.devtools = false

        new Vue({
          el: '#app',
          render (h) {
            return h(Component)
          }
        })
      `
      ),
      babelIt
    ]
  })

  cache[cacheKey] = (await bundle.generate({
    format: 'iife',
    name: 'App'
  })).code

  return cache[cacheKey]
}

const vueSource = readFileSync(
  resolve(__dirname, '../../node_modules/vue/dist/vue.min.js')
)

async function open(name, browser, code, id = '#test') {
  const page = await browser.newPage()

  const content = `
  <!doctype html>
  <html>
    <head>
      <title>${name}</title>
    </head>
    <body>
      <div id="app"></div>
      <script>${vueSource}</script>
      <script>${await code}</script>
    </body>
  </html>`

  // Un-comment following lines to debug generated HTML.
  if (!Boolean(process.env.CI)) {
    const fs = require('fs')
    const path = require('path')
    const dir = path.join(__dirname, '../output')

    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    fs.writeFileSync(path.join(dir, name + '.html'), content)
  }

  await page.setContent(content)

  await page.waitFor(id)

  return page
}
