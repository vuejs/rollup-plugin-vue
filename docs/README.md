# Introduction

:::warning
This guide is work in progress.
:::

:::tip VERSION NOTE
This is the documentation for Rollup Plugin Vue v4 and above. If you are upgrading from v2 or an earlier version, check out the [Migration Guide](./migrating.md). If you are using an older version, the old docs are [here](https://github.com/vuejs/rollup-plugin-vue/tree/2.2/docs).
:::

## What is Rollup Plugin Vue?

`rollup-plugin-vue` is a plugin for [rollup](https://rollupjs.org/) that allows you to author Vue components in a format called [Single-File Components (SFCs)](https://vue-loader.vuejs.org/spec.html):

``` vue
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
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

There are many cool features provided by `rollup-plugin-vue`:

- Feature parity with [vue-loader](https://vue-loader.vuejs.org)
- Allows custom blocks in a `.vue` file;
- Treat static assets referenced in `<style>` and `<template>` as module dependencies;
- Simulate scoped CSS for each component.

Rollup is a module bundler which makes `rollup-plugin-vue` ideal for packaging Vue plugins and UI component libraries.
