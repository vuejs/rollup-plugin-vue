# Archived

This is no longer maintained. Use [Vite](https://vitejs.dev/) and [`@vitejs/plugin-vue`](https://github.com/vitejs/vite/tree/main/packages/plugin-vue) instead.

---

# rollup-plugin-vue@next

> Roll Vue 3 SFCs with Rollup.


``` js
import vuePlugin from 'rollup-plugin-vue'

export default {
  plugins: [
    vuePlugin(/* options */)
  ]
}
```

## Options

``` js
export interface Options {
  include: string | RegExp | (string | RegExp)[]
  exclude: string | RegExp | (string | RegExp)[]

  // use 'node' if compiling for SSR
  target: 'node' | 'browser'

  // if true, will attach __file to component even in production.
  // defaults to false.
  exposeFilename: boolean

  // if true, handle preprocessors directly instead of delegating to other
  // rollup plugins
  // defaults to false.
  preprocessStyles?: boolean
  cssModulesOptions?: {
    // https://github.com/css-modules/postcss-modules#usage
  }

  // these are simply passed on to @vue/compiler-sfc
  compiler
  compilerOptions
  transformAssetUrls
  preprocessCustomRequire
}
```
