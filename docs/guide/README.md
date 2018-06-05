# Getting Started

Add `rollup-plugin-vue` to `plugins` option of the rollup config. That's pretty much everything.

``` js {3,9}
// file: rollup.config.js

import vue from 'rollup-plugin-vue'

export default {
  // ...
  plugins: [
    // ...
    vue(/* options */)
    // ...
  ]
}
```
