# Frequently Asked Questions

- **Why does `__file` use absolute path?**  
  The `__file` variable is used by devtools to provide "open in editor" feature. However, in production mode only filename is used. See issue [#258](https://github.com/vuejs/rollup-plugin-vue/issues/258) to enable production mode.

- **Error: Cannot find module `vue-template-compiler`?**  
  `vue-template-compiler` has a constraint that it should be exact same version as `vue` that is why it is included as peer dependency. Make sure you install `vue-template-compiler` and `vue` in your project.

- **Error: Cannot find module `less` or `node-sass` or `stylus`?**  
  If you're using any of the style languages (other than css) supported in `.vue` file, you have to install that language's compiler.