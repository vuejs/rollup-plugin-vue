import { rollup, RollupOutput, RollupWarning } from 'rollup'

describe('simple', () => {
  let result!: RollupOutput

  beforeAll(async () => {
    result = await roll('simple')
  })

  it('should compile <template>', () => {
    expect(result.output[0].code).toEqual(expect.stringContaining('.render ='))
  })
})

describe('no-template', () => {
  let result!: RollupOutput

  beforeAll(async () => {
    result = await roll('no-template')
  })

  it('should leave the render function alone when no template is in the SFC', () => {
    expect(result.output[0].code).not.toEqual(
      expect.stringContaining('.render =')
    )
  })
})

describe('custom-block', () => {
  let result!: RollupOutput

  beforeAll(async () => {
    result = await roll('custom-block')
  })

  it('should compile <i18n>', () => {
    expect(result.output[0].code).toEqual(
      expect.stringContaining(
        'component.i18n = {"say":{"hello":"Hello :name"}}'
      )
    )
  })
})

describe('css-modules', () => {
  let result!: RollupOutput

  beforeAll(async () => {
    result = await roll('css-modules')
  })

  it('should process <style module> blocks', () => {
    expect(result.output[0].code).toEqual(
      expect.stringContaining('cssModules["$style"] =')
    )
    expect(result.output[0].code).not.toEqual(
      expect.stringContaining('.red {\n  color: red;\n}')
    )
    expect(result.output[0].code).toEqual(expect.stringContaining('._red_'))
    expect(result.output[0].code).toEqual(
      expect.stringContaining('{"red":"_red_')
    )
  })

  it('should process <style scoped> blocks', () => {
    expect(result.output[0].code).toEqual(
      expect.stringContaining('.__scopeId = "data-v-')
    )
    expect(result.output[0].code).not.toEqual(
      expect.stringContaining('.green {\n  color: red;\n}')
    )
    expect(result.output[0].code).toEqual(
      expect.stringContaining('.green[data-v-')
    )
  })
})

describe('typescript', () => {
  let result!: RollupOutput

  beforeAll(async () => {
    result = await roll('typescript')
  })

  it('should compile <script lang="ts">', () => {
    expect(result.output[0].code).toEqual(
      expect.stringContaining("name: 'App'")
    )
    expect(result.output[0].code).toEqual(
      expect.stringContaining("title: 'Bar'")
    )
  })
})

import Path from 'path'
async function roll(name: string) {
  const configFile = `../examples/${name}/rollup.config.js`
  const configModule = require(configFile)
  const configs = configModule.__esModule ? configModule.default : configModule
  const config = Array.isArray(configs) ? configs[0] : configs

  config.input = Path.resolve(__dirname, Path.dirname(configFile), config.input)
  delete config.output

  config.onwarn = function (warning: RollupWarning, warn: Function) {
    switch (warning.code) {
      case 'UNUSED_EXTERNAL_IMPORT':
        return
      default:
        warning.message = `(${name}) ${warning.message}`
        warn(warning)
    }
  }

  const bundle = await rollup(config)

  return bundle.generate({ format: 'esm' })
}
