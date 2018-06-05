# Migration from v2

## css

Set options to `{ css: false }` to externalize styles and then handle using [rollup-plugin-css-only](https://github.com/thgh/rollup-plugin-css-only).

## compileTemplate

Vue v1.x specific option. As `rollup-plugin-vue` v4.x does not support Vue v1.x, this option is no more relevant.

## htmlMinifier

Vue v1.x specific option. As `rollup-plugin-vue` v4.x does not support Vue v1.x, this option is no more relevant.

## inject

CSS is auto injected. This can be disabled by setting options to `{ css: false }`.

## stripWith

`with(this)` is stripped off by default. No configuration required.

## styleToImports

Setting options to `{ css: false }` externalize styles by converting `<style>` blocks to ES6 import statements.
