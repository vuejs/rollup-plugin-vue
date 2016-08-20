"use strict";

const buble = require('rollup-plugin-buble');
const rollup = require('rollup');
const zlib = require('zlib');
const fs = require('fs');
const pack = require('../package.json');
const banner = require('./banner');

// update main file
let main = fs
    .readFileSync('src/index.js', 'utf-8')
    .replace(/plugin\.version = '[\d\.]+'/, `plugin.version = '${pack.version}'`);

fs.writeFileSync('src/index.js', main);

// CommonJS build.
// this is used as the "main" field in package.json
// and used by bundlers like Webpack and Browserify.
rollup.rollup({
        entry: 'src/index.js',
        onwarn: function () {},
        plugins: [
            buble()
        ]
    })
    .then(function (bundle) {
        return write('dist/' + pack.name + '.common.js', bundle.generate({
            format: 'cjs',
            banner: banner
        }).code)
    })
    .catch(logError)

function write(dest, code) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(dest, code, function (err) {
            if (err) return reject(err)
            console.log('Rolled', green(dest), getSize(code.length))
            resolve()
        })
    })
}

function getSize (bytes) {
  bytes /= 1024
  return bytes < 1000 ? bytes.toPrecision(3) + ' kB' : (bytes / 1024).toPrecision(3) + ' MB'
}

function logError(e) {
    console.log(e)
}

function green (str) {
  return '\u001b[1m\u001b[32m' + str + '\u001b[39m\u001b[22m'
}

