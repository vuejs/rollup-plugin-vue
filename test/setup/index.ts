import * as fs from 'fs'
import * as path from 'path'
import {Browser, Page} from 'puppeteer'
import {rollup} from 'rollup'
import promised from '@znck/promised'

import {pluginCreateVueApp, plugins} from "./plugins"
import pluginVue from '../..'

const pluginCSS = require('rollup-plugin-css-only')
const assets = require('postcss-assets')

// -- rollup plugin inline file

const cache = {}

export async function build(filename, css = false): Promise<string> {
  const cacheKey = JSON.stringify({filename, css})
  if (cacheKey in cache) return cache[cacheKey]
  let style: string = ''
  const input = filename + '__app.js'
  const options = {defaultLang: {markdown: 'pluginMarkdown'}, css: css, style: {
    postcssPlugins: [assets({ basePath: '/' })]
  }}
  const bundle = await rollup({
    input,
    plugins: [
      pluginCreateVueApp(input, filename),
      pluginCSS({
        output: (s: string) => {
          style = s
        }
      }),
      pluginVue(options),
      ...plugins
    ],
    external: ['vue']
  })

  const output = await bundle.generate({
    format: 'iife',
    name: 'App',
    sourcemap: true,
    globals: {
      vue: 'Vue'
    }
  })

  let outputCode = output.code

  if (style) {
    outputCode += `\n;(function() { 
      var s = document.createElement('style'); 
      s.type = 'text/css'; 
      document.head.appendChild(s);
      s.appendChild(document.createTextNode(${JSON.stringify(style)}))
    })()` 
  }

  outputCode += `\n\n//# sourceMappingURL=data:application/json;base64,${new Buffer(JSON.stringify(output.map)).toString('base64')}\n`

  cache[cacheKey] = outputCode

  return outputCode
}

const VUE_SOURCE = promised(fs).readFile(
  path.resolve(__dirname, '../../node_modules/vue/dist/vue.min.js')
)

function encode(any: any) {
  return any.toString().replace(/<\//g, '&lt;\/')
}

export async function open(name: string, browser: Browser, code: string, id: string = '#test'): Promise<Page> {
  const page = await browser.newPage()

  const content = `
  <!doctype html>
  <html>
    <head>
      <title>${name}</title>
    </head>
    <body>
      <div id="app"></div>
      <script>
      ${encode(await VUE_SOURCE)}
      </script>
      <script>
      ${encode(await code)}
      </script>
    </body>
  </html>`

  // Un-comment following lines to debug generated HTML.
  if (!Boolean(process.env.CI)) {
    const dir = path.join(__dirname, '../output')

    if (!await promised(fs).exists(dir)) await promised(fs).mkdir(dir)
    await promised(fs).writeFile(path.join(dir, name + '.html'), content)
  }

  await page.setContent(content)

  await page.waitFor(id)

  return page
}