# Frequently Asked Questions

- **Why does `__file` use absolute path?**  
  The `__file` variable is used by devtools to provide "open in editor" feature. However, in production mode only filename is used. See issue [#258](https://github.com/vuejs/rollup-plugin-vue/issues/258) to enable production mode.

- **Error: Cannot find module `vue-template-compiler`?**  
  `vue-template-compiler` has a constraint that it should be exact same version as `vue` that is why it is included as peer dependency. Make sure you install `vue-template-compiler` and `vue` in your project.

- **Error: Cannot find module `less` or `sass` or `stylus`?**  
  If you're using any of the style languages (other than css) supported in `.vue` file, you have to install that language's compiler.
  
- **Error: 'default' is not exported by node_modules/vue-runtime-helpers/dist/normalize-component.js**  
  You may encounter this error when using version 4.6.2 onwards. The solution is to include `rollup-plugin-commonjs`. In your config file `rollup.config.js`, you have to import this plugin and invoke it like so:
  
  ```
  import vue from 'rollup-plugin-vue';
  import commonjs from 'rollup-plugin-commonjs';

  export default {
    entry: 'index.js',
    plugins: [
      commonjs(),
      vue(),
    ]
  }
  ```
  
