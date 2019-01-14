import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

const input = 'src/index.ts'
const plugins = [typescript({
  typescript: require('typescript')
})]

function external(id) {
  return id in pkg.dependencies || id in pkg.peerDependencies || ['path'].includes(id)
}

export default [
  {
    input,
    plugins,
    external,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'default',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
  },
]
