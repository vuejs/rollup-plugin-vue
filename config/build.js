"use strict";

const buble = require('rollup-plugin-buble');
const rollup = require('rollup');
const replace = require('rollup-plugin-replace');
const zlib = require('zlib');
const fs = require('fs');
const pack = require('../package.json');
const banner = require('./banner');

let main = fs
      .readFileSync('src/index.js', 'utf-8')
      .replace(/plugin\.version = '[\d\.]+'/, `plugin.version = '${pack.version}'`);

fs.writeFileSync('src/index.js', main);

rollup.rollup({
          entry: 'src/index.js',
          plugins: [
              buble({
                  objectAssign: 'Object.assign',
                  transforms: {
                      dangerousForOf: true
                  }
              })
          ]
      })
      .then(function (bundle) {
          bundle.write({
              format: 'cjs',
              dest: 'dist/' + pack.name + '.common.js',
          });
          bundle.write({
              format: 'es',
              dest: 'dist/' + pack.name + '.js',
          });
      })
      .catch(function logError(e) {
          console.log(e)
      });
