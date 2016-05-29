import fs from 'fs'
import path from 'path'

let defaultBabelOptions = {
  presets: ['es2015-rollup']
}
let babelRcPath = path.resolve(process.cwd(), '.babelrc')
let babelOptions = fs.existsSync(babelRcPath)
    ? getBabelRc() || defaultBabelOptions
    : defaultBabelOptions

function getBabelRc () {
  let rc = null
  try {
    rc = JSON.parse(fs.readFileSync(babelRcPath, 'utf-8'))
  } catch (e) {
    throw new Error('[rollup-plugin-vue] Your .babelrc seems to be incorrectly formatted.')
  }
  return rc
}

export default {
  autoprefixer: {remove: false},
  babel: babelOptions,
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
  }
}
