const rollup = require('rollup').rollup
const vue = require('../dist/rollup-plugin-vue.common.js')
const buble = require('rollup-plugin-buble')
const uglify = require('uglify-js')
const CleanCSS = require('clean-css')
const fs = require('fs')
const stylus = require('stylus')


rollup({
  entry: 'index.js',
  plugins: [
    vue({
      compileTemplate: true,
      css (styles, stylesNodes) {
        write('dist/papervue.styl', styles)
        stylus.render(styles, function (err, css) {
          if (err) throw err
          write('dist/papervue.css', css)
          write('dist/papervue.min.css', new CleanCSS().minify(css).styles)
        })
      }
    }),
    buble()
  ]
})
  .then(function (bundle) {
    var code = bundle.generate({
      format: 'umd',
      moduleName: 'helloRollupVue',
      useStrict: false
    }).code
    return write('dist/papervue.js', code).then(function () {
      return code
    })
  })
  .then(function (code) {
    var minified = uglify.minify(code, {
      fromString: true,
      output: {
        ascii_only: true
      }
    }).code
    return write('dist/papervue.min.js', minified)
  })
  .catch(logError)

function write (dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
