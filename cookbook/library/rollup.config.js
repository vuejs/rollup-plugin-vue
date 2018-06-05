import vue from 'rollup-plugin-vue'

export default [
  // ESM build to be used with webpack/rollup.
  {
    input: 'src/MyComponent.vue',
    output: {
      format: 'esm',
      file: 'dist/MyComponent.esm.js'
    },
    plugins: [
      vue()
    ]
  },
  // SSR build.
  {
    input: 'src/MyComponent.vue',
    output: {
      format: 'cjs',
      file: 'dist/MyComponent.ssr.js'
    },
    plugins: [
      vue({ template: { optimizeSSR: true } })
    ]
  },
  // Browser build.
  {
    input: 'src/wrapper.js',
    output: {
      format: 'iife',
      file: 'dist/MyComponent.js'
    },
    plugins: [
      vue()
    ]
  }
]
