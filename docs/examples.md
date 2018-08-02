# Examples

These examples cover most common or interesting use cases, and also progressively explain more complex detail. Our goal is to move beyond a simple introductory example, and demonstrate concepts that are more widely applicable, as well as some caveats to the approach.

## Minimal

`rollup-plugin-vue` ships as zero config solution to package `.vue` files.

<<< @/cookbook/minimal/rollup.config.js{1,10}

Source: [cookbook/minimal](https://github.com/vuejs/rollup-plugin-vue/tree/master/cookbook/minimal)

## Extract CSS

Setting `{ css: false }` converts `<style>` blocks to import statements so style plugins like `rollup-plugin-css-only` can extract styles in `.vue` files.

<<< @/cookbook/extract-css/rollup.config.js{2,11,12}

Source: [cookbook/extract-css](https://github.com/vuejs/rollup-plugin-vue/tree/master/cookbook/extract-css)

## Typescript

<<< @/cookbook/typescript-simple/rollup.config.js{2,12-16}

Source: [cookbook/typescript-simple](https://github.com/vuejs/rollup-plugin-vue/tree/master/cookbook/typescript-simple)

## SSR

<<< @/cookbook/ssr/rollup.config.js{10}

Source: [cookbook/ssr](https://github.com/vuejs/rollup-plugin-vue/tree/master/cookbook/ssr)

## Component Library

<<< @/cookbook/library/rollup.config.js{8,12,19,23,30,34}

Source: [cookbook/library](https://github.com/vuejs/rollup-plugin-vue/tree/master/cookbook/library)
