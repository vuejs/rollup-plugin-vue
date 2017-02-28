"use strict";

const babel = require('rollup-plugin-babel');
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
              babel({ runtimeHelpers: true })
          ],
          external (id) {
              if (/babel-runtime\/.*/i.test(id)) {
                  return true
              }

              return [
                        'camelcase',
                        'coffeescript-compiler',
                        'de-indent',
                        'debug',
                        'fs',
                        'html-minifier',
                        'less',
                        'magic-string',
                        'merge-options',
                        'node-sass',
                        'parse5',
                        'path',
                        'postcss',
                        'postcss-modules',
                        'posthtml',
                        'posthtml-attrs-parser',
                        'pug',
                        'rollup-pluginutils',
                        'vue-template-es2015-compiler',
                        'vue-template-validator',
                    ].indexOf(id) > -1
          }
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
