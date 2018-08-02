# Getting Started

Add `rollup-plugin-vue` to the `plugins` array in `rollup.config.js`:

``` js
import vue from 'rollup-plugin-vue'

export default {
  // ...
  plugins: [
    // ...
    vue(/* options */)
  ]
}
```

That's all you need! You can customize this plugin's behavior by passing it an optional [options object](/options.html).
