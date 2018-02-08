const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const vue = require('../../')

const fs = require('fs')
const path = require('path')
const TEST_ENV = process.env.TEST_ENV || 'browser'

async function build (input, output) {
  console.log('Building: ' + path.basename(input))
  const bundle = await rollup.rollup({
    entry: input,
    plugins: [ vue(), babel() ],
    external: ['vue-component-compiler/src/runtime/normalize-component']
  })

  console.log('Exporting: ' + path.basename(output))
  await bundle.write({
    dest: output,
    format: 'es'
  })
}

// -- Build all fixtures --

const fixturesDirectory = path.resolve(__dirname, '..', 'fixtures')
// const entries = fs.readdirSync(fixturesDirectory).filter(it => it.endsWith('.vue')).map(it => path.join(fixturesDirectory, it))
const entries = [path.join(fixturesDirectory, 'scoped-css.vue')]

;(async () => {
  try {
    await Promise.all(
      entries.map(entry => {
        try {
          return build(entry, entry.replace('fixtures', 'target/' + TEST_ENV).replace(/\.vue$/, '.js'))
        } catch (e) {
          console.log(e)
        }
      })
    )
  } catch (e) {
    console.log(e)
  }
})()
