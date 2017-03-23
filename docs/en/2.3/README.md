---
nav: en2.3
search: 
  - en
  - v2.3
---

## Installation
[Node][node] and [Rollup][rollup] are required to use rollup-plugin-vue. Use [NPM][NPM] or [yarn][yarn] to add `rollup-plugin-vue` as development dependency to your project.

##### Using NPM
```
npm install --save-dev rollup-plugin-vue
```

##### Using yarn
```
yarn add --dev rollup-plugin-vue
```

##### Use plugin
Next add `rollup-plugin-vue` to `rollup` plugins.

``` js
// rollup.config.js
import vue from 'rollup-plugin-vue';

export default {
  plugins: [
    vue({ /* configuration options. */ }),
  ],
};
```
## Configuration
For most cases `rollup-plugin-vue` works out of the box. But, you can always configure it to your needs.

### Style
This section lists config options for `<style>` elements.

#### Custom handler
The `css` option accepts style handling options.
- Set `css: null` to extract a consolidated style file in `dist/bundle.css`.
- Set `css: false` to disable style at all.
- Set `css: true` to dynamically inject as `<style>` tags via JavaScript.
- Set `css: String` (eg: `css: 'dist/css/my-bundle.css`) to extract a consolidated style file in `dist/css/my-bundle.css`.
- Set `css: Function` to provide a custom handler. Your handler would receive 3 parameters:
    - `style: String` - A string with all style elements' content concatenated.
    - `styles: Array` - A list of style elements. Each style element would an object with following keys:
        - `code: String` - Contents of the `<style>` element.
        - `id: String` - Path of the `.vue` file.
        - `lang: String` - Language defined on `<style>` element (defaults to `css`).
        - `module: Boolean` - Is `<style>` element a CSS module?
        - `scoped: Boolean` - Should `<style>` element be scoped? <p class="warning">Scoped styles are not supported yet.</p>
        - `map: Object` - Source map object.
        - `$compiled: { code: String, ?map: Object }` - If [auto styles](#auto-styles) is enabled, `<style>` is transformed to `css`.
    - `compile: Function` - An async compiler that takes two parameters:
        - `style: { code: String, lang: String, ?map: Object }` - Style code and language.
        - `options: { ?sass: Object, ?less: Object, ?stylus: Object, ?cssModules: Object }` - Processing library configuration options.

    ``` js
    // rollup.config.js
    import fs from 'fs'
    import vue from 'rollup-plugin-vue'

    export default {
        ...
        plugins: [
            vue({
                css (style, styles, compiler) {
                    fs.writeFileSync('dist/bundle.css', style)
                    fs.writeFileSync('dist/bundle.sass', styles.map(style => style.code).concat('\n'))
                }
            })
        ],
        ...
    }
    ```

#### Auto Styles
Style elements are automatically processed using relevant libraries (eg: node-sass for scss/sass). This is enabled by default. Set `autoStyles: false` to disable.

#### Style Languages
You can specify `<style>` language using `lang` attribute (eg: `<style lang="scss"></style>`).
List of supported style languages:

- ##### CSS
The default style language.

- ##### Sass/Scss
It uses `node-sass@^4.5.0` to process `sass/scss` style elements. You can provide `node-sass` configuration options by setting:
``` js
scss: { /* node-sass options */}
```

- ##### Less
It uses `less@^2.7.2` to process `less` style elements. You can provide `less` configuration options by setting:
``` js
less: { /* node-sass options */}
```

- ##### Stylus
It uses `stylus@^0.54.5` to process `stylus` style elements. You can provide `stylus` configuration options by setting:
``` js
stylus: { /* stylus options */}
```

<p class="tip" markdown="1">
`node-sass`, `less` and `stylus` are optional dependencies. If you are using `scss/sass/less/stylus` you should require (`yarn add --dev node-sass less stylus`) them.
</p>

#### Use other plugins
Set `autoStyles: false` and `styleToImport: true` to import style as a dependency and plugins like [rollup-plugin-scss](https://github.com/differui/rollup-plugin-sass) can be used.

``` js
// rollup.config.js
import vue from 'rollup-plugin-vue'
import scss from 'rollup-plugin-scss'

export default {
    ...
    plugins: [
        vue({ autoStyles: false, styleToImport: true }),
        scss()
    ],
    ...
}
```

#### CSS Modules
[CSS Modules](https://github.com/css-modules/css-modules) is a popular system for modularizing and composing CSS. `rollup-plugin-vue` provides first-class integration with CSS Modules as an alternative for simulated scoped CSS.

``` vue
<style module>
.red {
  color: red;
}

.bold {
  font-weight: bold;
}
</style>

<template>
  <div>
    <p :class="{ [$style.red]: isRed }">
      Am I red?
    </p>

    <p :class="[$style.red, $style.bold]">
      Red and bold
    </p>
  </div>
</template>

<script>
export default {
  computed: {

    $style () {
        return this.$options.cssModules
    }

  }
}
</script>
```

<p class="tip">
`rollup-plugin-vue@^2.3` cannot add `$style` computed property. You have to explcitly add it.
</p>

``` js
$style () {
    return this.$options.cssModules
}
```

##### Custom Inject Name
You can have more than one `<style>` tags in a single *.vue component. To avoid injected styles to overwrite each other, you can customize the name of the injected computed property by giving the module attribute a value:

```
<style module="a">
  /* identifiers injected as a */
</style>

<style module="b">
  /* identifiers injected as b */
</style>
```
##### CSS Modules Configuration
`rollup-plugin-vue` uses `postcss-modules` to handle CSS modules.

You can provide `postcss-modules` configuration options by setting:
``` js
cssModules: { generateScopedName: '[name]__[local]', ... }
```

### Template
Templates are processed into `render` function by default. You can disable this by setting:
``` js
compileTemplate: false
```

Additionally, you can pass options to the [template compiler](https://www.npmjs.com/package/vue-template-compiler) by setting:
``` js
compileOptions: {
  preserveWhitespace: false
}
```

#### Static Class Replacement
When using CSS modules, class names are replaced in template at compile time.

For example:
```
<div class="red">Foo</div>
```
would become
```
<div class="_lkcjalei8942jksa_0">Foo</div>
```
before compiling to `render` function. This saves you from binding `class` attribute to `$style.red`.

You can disable this behavior by setting:
``` js
disableCssModuleStaticReplacement: true
```

#### Template Languages

- ##### HTML
Default template language.

- ##### Pug/Jade
It uses `pug@^2.0.0-beta11` to process `pug` template elements. You can provide `pug` configuration options by setting:
``` js
pug: { /* pug options */}
```

### Script

#### Script Languages
ES6 is catching up but `coffee` script is still popular with some developers.

- ##### Coffee
It uses `coffeescript-compiler@^0.1.1` to process `coffee` script elements. You can use `lang="coffee"` or `lang="coffeescript"`.

### Handle with(this) issue
Vue uses `with(this)` in render function as scoping rules of `with` aligns with scoping rules of templates. Using `with` in strict mode is forbidden.

`rollup-plugin-vue` strips away all `with(this)` statements by default. You can disable this by setting:
 ``` js
 vue: { transforms: { stripWith: false } }
 ```

[node]: http://nodejs.org/
[rollup]: http://rollupjs.org
[NPM]: https://www.npmjs.com/#getting-started
[yarn]: http://yarnpkg.com/
