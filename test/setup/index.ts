import * as fs from 'fs'
import * as path from 'path'
import {Browser, Page} from 'puppeteer'
import {rollup} from 'rollup'
import promised from '@znck/promised'

import {pluginCreateVueApp, plugins} from "./plugins"
import pluginVue from '../..'

const pluginCSS = require('rollup-plugin-css-only')

// -- rollup plugin inline file

const cache = {}

export async function build(filename, css = false): Promise<string> {
  const cacheKey = JSON.stringify({filename, css})
  if (cacheKey in cache) return cache[cacheKey]
  let style: string | undefined
  const input = filename + '__app.js'
  const options = {defaultLang: {markdown: 'pluginMarkdown'}, css: css}
  const bundle = await rollup({
    input,
    plugins: [
      pluginCreateVueApp(input, filename),
      pluginCSS({
        include: '**/*.css?*',
        output: (s: string) => {
          style = s
        }
      }),
      pluginVue(options),
      ...plugins
    ],
  })

  cache[cacheKey] = (await bundle.generate({
    format: 'iife',
    name: 'App'
  })).code + (style ? `;(function() { 
    var s = document.createElement('style'); 
    s.type = 'text/css'; 
    document.head.appendChild(s);
    s.appendChild(document.createTextNode(${JSON.stringify(style)}))
  })()` : '')

  return cache[cacheKey]
}

const VUE_SOURCE = promised(fs).readFile(
  path.resolve(__dirname, '../../node_modules/vue/dist/vue.min.js')
)

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
      <script>${await VUE_SOURCE}</script>
      <script>${await code}</script>
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