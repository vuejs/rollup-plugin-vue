/* global describe, it */
var vuePlugin = require('..')
var assert = require('assert')
var fs = require('fs')
var rollup = require('rollup').rollup
var path = require('path')

process.chdir(__dirname)

function read (file) {
  return fs.readFileSync(path.resolve(__dirname, file), 'utf-8')
}

function test (name) {
  it('should rollup ' + name + '.vue', function () {

    var entry = './fixtures/' + name + '.vue'
    var expected = read('expects/' + name + '.js')
    return rollup({
      entry: entry,
      plugins: [vuePlugin()]
    }).then(function (bundle) {
      var result = bundle.generate()
      var code = result.code
      assert.equal(code, expected, 'should compile correctly')
      return result
    }).catch(function (error) {
      throw error
    })
  })
}

describe('rollup-plugin-vue', function () {
  fs.readdirSync(path.resolve(__dirname, 'expects'))
    .forEach(function (file) {
      test(file.substr(0, file.length - 3))
    })
})
