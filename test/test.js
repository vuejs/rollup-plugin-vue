/* global describe, it */
var vuePlugin = require('../')
var cssPlugin = require('rollup-plugin-css-only')
var assert = require('assert')
var fs = require('fs')
var rollup = require('rollup')
var path = require('path')

process.chdir(__dirname)

function read(file) {
    return fs.readFileSync(path.resolve(__dirname, file), 'utf-8')
}

function test(name) {
    it('should rollup ' + name + '.vue', function () {

        var entry = './fixtures/' + name + '.vue'
        var expected = read('expects/' + name + '.js').replace(/\r/g, '')
        var actualCss
        var cssHandler = function (css, styles) {
            if (['scss', 'pug'].indexOf(name) > -1) {
                actualCss = styles[0].$compiled.code
            } else {
                actualCss = css
            }
        }

        return rollup.rollup({
            entry: entry,
            plugins: [vuePlugin({
                css: ['no-css-extract'].indexOf(name) > -1 ? true : cssHandler,
                modules: {
                    generateScopedName: '[name]__[local]'
                },
              compileTemplate: [
                  'compileTemplate',
                  'compileTemplateLocalComponent',
                  'slot',
                  'table',
                  'table-n-slot'
              ].indexOf(name) > -1
            })]
        }).then(function (bundle) {
            var result = bundle.generate({ format: 'es' })
            var code = result.code
            assert.equal(code.trim(), expected.trim(), 'should compile code correctly')

            // Check css output
            if (['style', 'css-modules', 'css-modules-static', 'scoped-css', 'scss', 'pug', 'less', 'stylus'].indexOf(name) > -1) {
                var css = read('expects/' + name + '.css')
                assert.equal(css.trim(), actualCss.trim(), 'should output style tag content')
            } else if (['no-css-extract'].indexOf(name) > -1) {
                assert.equal(undefined, actualCss, 'should ignore css()')
            } else {
                assert.equal('', actualCss.trim(), 'should always call css()')
            }
        }).catch(function (error) {
            throw error
        })
    })
}

describe('rollup-plugin-vue', function () {
    fs.readdirSync(path.resolve(__dirname, 'fixtures'))
          .forEach(function (file) {
              test(file.substr(0, file.length - 4))
          })
})

describe('styleToImports', function () {
    it('should convert style to import', function () {
        var entry = './fixtures/style.vue'
        var expectedCss = read('expects/style.css')
        var actualCss

        return rollup.rollup({
            format: 'cjs',
            entry: entry,
            plugins: [
                vuePlugin({
                    styleToImports: true,
                }),
                cssPlugin({
                    output: function (css) {
                        actualCss = css
                    },
                }),
            ],
        }).then(function (bundle) {
            bundle.generate({ format: 'es' })

            assert.equal(expectedCss.trim(), actualCss.trim(), 'should import style')
        }).catch(function (error) {
            throw error
        })
    })
})
