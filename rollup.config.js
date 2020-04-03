import typescript from '@rollup/plugin-typescript'
import { dependencies, peerDependencies } from './package.json'

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/index.ts',
  output: {
    format: 'cjs',
    dir: 'dist',
    sourcemap: true,
    exports: 'default'
  },
  external: [
    'path',
    'querystring',
    ...Object.keys(dependencies),
    ...Object.keys(peerDependencies),
  ],
  plugins: [typescript()]
}

export default config
