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
            console.log(blue(dest) + ' ' + getSize(code))
            resolve()
        })
    })
}

function getSize(code) {
    return (code.length / 1024).toFixed(2) + 'kb'
}

function logError(e) {
    console.log(e)
}

function blue(str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
