/* global describe, it */

"use strict";


var vuePlugin = require('..');
var assert = require('assert');
var fs = require('fs');
var rollup = require('rollup').rollup;
var diff = require('diff');
var path = require('path');
var hash = require('hash-sum');

process.chdir(__dirname);

vuePlugin.compiler.applyConfig({
    // test cutom transform.
    customCompilers: {
        test: function (content, cb) {
            content = content.replace('not ', '');
            cb(null, content)
        }
    }
});

function read(file) {
    return fs.readFileSync(path.resolve(__dirname, file), 'utf-8')
}

function test(name) {
    it('should rollup ' + name + '.vue', function () {

        var entry = './fixtures/' + name + '.vue';
        var expected = read('expects/' + name + '.js').replace(/\{\{id}}/g, '_v-' + hash(require.resolve(entry)));

        var deps = [];

        function addDep(file) {
            deps.push(file)
        }

        process.env.VUEIFY_TEST = true;
        process.env.NODE_ENV = name === 'non-minified' ? 'development' : 'production';

        vuePlugin.compiler.on('dependency', addDep);

        return rollup({
            entry: entry,
            plugins: [vuePlugin()]
        }).then(function (bundle) {
            var result = bundle['generate']();
            var code = result.code;

            assert.equal(code, expected, 'should compile correctly');
            // check src

            if (name === 'src') {
                assert.equal(deps[0], __dirname + '/fixtures/test.html', 'should have loaded src.');
                assert.equal(deps[1], __dirname + '/fixtures/test.styl', 'should have loaded src.');
                assert.equal(deps[2], __dirname + '/fixtures/src/test.js', 'should have loaded src.');
            }

            if (name === 'less' || name === 'sass' || name === 'styl') {
                assert.equal(deps[0], __dirname + '/fixtures/imports/import.' + name, 'should have dependencies.');
            }
            vuePlugin.compiler.removeListener('dependency', addDep);

            return result;

        }).catch(function (error) {
            throw error;
        });
    });
}


describe('rollup-plugin-vue', function () {
    fs.readdirSync(path.resolve(__dirname, 'expects'))
        .forEach(function (file) {
            test(file.substr(0, file.length - 3));
        })
});