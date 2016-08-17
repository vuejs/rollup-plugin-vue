import fs from 'fs'
import path from 'path'

let defaultBubleOptions = {
  transforms: {
    modules: false
  }
}
// Not sure if 'buble.config.js' is the supposed filename
let bubleOptionsPath = path.resolve(process.cwd(), 'buble.config.js')
let bubleOptions = fs.existsSync(bubleOptionsPath) && getBubleConfig() || defaultBubleOptions

function getBubleConfig () {
  let rc = null
  try {
    rc = JSON.parse(fs.readFileSync(bubleOptionsPath, 'utf-8'))
  } catch (e) {
    throw new Error('[rollup-plugin-vue] Your buble.config.js seems to be incorrectly formatted.')
  }
  return rc
}

export default {
  autoprefixer: {remove: false},
  buble: bubleOptions,
  htmlMinifier: {
    customAttrSurround: [[/@/, new RegExp('')], [/:/, new RegExp('')]],
    collapseWhitespace: true,
    removeComments: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    // this is disabled by default to avoid removing
    // "type" on <input type="text">
    removeRedundantAttributes: false,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true
  },
  postcss: {
    plugins: [],
    options: {}
  }
}
