---
sidebar: auto
---
# Options Reference

## include

- type: `Array<string|RegExp> | string | RegExp`
- default: `[/\.vue$/i]`

## exclude

- type: `Array<string|RegExp> | string | RegExp`
- default: `[]`

## defaultLang

- type: `{ [key: string]: string }`
- default: `{}`

By default, `<script>` is JavaScript, `<style>` is CSS and `<template>` is HTML but you can have your project defaults.

e.g.: `defaultLang: { script: 'ts' }` would set default `<script>` block language to typescript.

::: warning
`defaultLang` does not set default language in templates for your editor/IDE.
:::

## blackListCustomBlocks

- type: `string[]`
- default: `['*']`

Exclude custom block from final bundle.

## whiteListCustomBlocks

- type: `string[]`
- default: `[]`

Include custom block in final bundle.

## css

- type: `boolean`
- default: `true`

Inject CSS in JavaScript. Setting `css: false` would extract styles in a `.css` file.

## script

## style

### postcssOptions

- type: `any`
- default: `undefined`

### postcssPlugins

- type: `any[]`
- default: `undefined`

### postcssCleanOptions

- type: `object`
- default: `{}`

### postcssModulesOptions

- type: `object`
- default:

  ``` js
  { 
    generateScopedName: '[path][local]-[hash:base64:4]' 
  }
  ```

### preprocessOptions

- type: `{ [lang: string]: object }`
- default: `{}`

### trim

- type: `boolean`
- default: `true`

## template

### compiler

- type: `VueTemplateCompiler`
- default: `require('vue-template-compiler')`

Override the default compiler used to compile `<template>` blocks in single file components.

### compilerOptions

- type: `Object`
- default: `{}`

Options for the template compiler. When using the default vue-template-compiler, you can use this option to add custom compiler directives, modules, or discard whitespaces between template tags with `{ preserveWhitespace: false }`.

See [`vue-template-compiler` options reference](https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#options).

### transformAssetUrls

- type: `{ [tag: string]: string | Array<string> }`
- default:

  ``` js
  {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
  ```

During template compilation, the compiler can transform certain attributes, such as `src` URLs, into `require` calls, so that the target asset can be handled by webpack. For example, `<img src="./foo.png">` will attempt to locate the file `./foo.png` on your file system and include it as a dependency of your bundle.

### isProduction

- type: `boolean`
- default: `process.env.NODE_ENV === 'production' || process.env.BUILD === 'production'`

Force production mode, which prohibits the plugin from emitting code that is development-only.

### optimizeSSR

- type: `boolean`
- default: `process.env.VUE_ENV === 'server'`

Enable Vue 2.4 SSR compilation optimization that compiles part of the vdom trees returned by render functions into plain strings, which improves SSR performance. In some cases you might want to explicitly turn it off because the resulting render functions can only be used for SSR and cannot be used for client-side rendering or testing.

### transpileOptions

- type: `Object`
- default: `{}`

Configure ES2015+ to ES5 transpiling options for the generated render function code. The [transpiler](https://github.com/vuejs/vue-template-es2015-compiler) is a fork of [Buble](https://github.com/Rich-Harris/buble), so consult the available options [here](https://buble.surge.sh/guide/#using-the-javascript-api).

The template render functions compilation supports a special transform `stripWith` (enabled by default), which removes the `with` usage in generated render functions to make them strict-mode compliant.

## normalizer

- type: `string`
- default: `undefined`

## styleInjector

- type: `string`
- default: `undefined`

## styleInjectorSSR

- type: `string`
- default: `undefined`

## styleInjectorShadow

- type: `string`
- default: `undefined`
