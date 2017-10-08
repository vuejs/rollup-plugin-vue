'use strict'

const babel = require('rollup-plugin-babel')
const rollup = require('rollup')
const pack = require('../package.json')

const dependencies = Object.keys(pack.dependencies).concat('path')

rollup
  .rollup({
    input: 'src/index.js',
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
  .then(bundle => {
    bundle.write({
      format: 'cjs',
      file: 'dist/' + pack.name + '.common.js',
      sourcemap: true
    })
    bundle.write({
      format: 'es',
      file: 'dist/' + pack.name + '.js',
      sourcemap: true
    })
  })
  .catch(console.error)
