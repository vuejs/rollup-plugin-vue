/* global describe, it */

"use strict";

import vuePlugin  from '../src';

const assert = require('assert');
const fs = require('fs');
const rollup = require('rollup').rollup;
var diff = require('diff');
var path = require('path');
var hash = require('hash-sum');

process.chdir(__dirname);

vuePlugin.compiler.applyConfig({
    // test cutom transform.
    customCompilers: {
        test: (content, cb) => {
            content = content.replace('not ', '');
            cb(null, content)
        }
    }
});

function read(file) {
    return fs.readFileSync(path.resolve(__dirname, file), 'utf-8')
}

function test(name) {
    it(`should rollup ${name}.vue`, function () {

        const entry = `./fixtures/${name}.vue`;
        const expected = read('expects/' + name + '.js').replace(/\{\{id}}/g, '_v-' + hash(require.resolve(entry)));

        let deps = [];

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
            const result = bundle['generate']();
            const code = result.code;

            //if (code !== expected) {
            //console.warn([code, expected]);
            //}

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