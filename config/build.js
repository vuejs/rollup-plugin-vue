'use strict'

const babel = require('rollup-plugin-babel')
const rollup = require('rollup')
const fs = require('fs')
const pack = require('../package.json')

const dependencies = Object.keys(pack.dependencies).concat('path')

rollup
  .rollup({
    entry: 'src/index.js',
    external(id) {
      return dependencies.some(it => it === id || id.startsWith(it))
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              target: { node: 6 }
            }
          ]
        ],
        plugins: [
          '@babel/plugin-proposal-object-rest-spread',
          '@babel/plugin-transform-runtime'
        ],
        runtimeHelpers: true
      })
    ]
  })
  .then(function(bundle) {
    bundle.write({
      format: 'cjs',
      dest: 'dist/' + pack.name + '.common.js'
    })
    bundle.write({
      format: 'es',
      dest: 'dist/' + pack.name + '.js'
    })
  })
  .catch(function logError(e) {
    console.log(e)
  })
