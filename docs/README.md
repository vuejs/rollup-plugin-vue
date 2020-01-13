# Introduction

:::tip VERSION NOTE
This is the documentation for Rollup Plugin Vue v4 and above. If you are upgrading from v2 or an earlier version, check out the [Migration Guide](./migrating.md). If you are using an older version, the old docs are [here](https://github.com/vuejs/rollup-plugin-vue/tree/2.2/docs).
:::

## What does Rollup Plugin Vue do?

This is a plugin for [rollup](https://rollupjs.org/) that allows you to author Vue components in a format called [Single-File Components (SFCs)](https://vue-loader.vuejs.org/spec.html). They look like this:

``` vue
<template>
  <div class="example">{{ message }}</div>
</template>

<script>
export default {
  data () {
    return {
      message: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>
```

This plugin also enables:

- scoped CSS
- custom blocks
- static assets references within `<style>` and `<template>`

And many other features, maintaining parity with [Vue Loader](https://vue-loader.vuejs.org).

## Why should I use Rollup over Webpack?

Rollup offers optimizations like tree shaking that make it ideal for building shared libraries. This plugin also prioritizes defaults that are ideal for most Vue plugins and UI component libraries.
