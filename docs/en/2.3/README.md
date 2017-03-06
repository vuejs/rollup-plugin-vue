## Installation
[Node][node] and [Rollup][rollup] are required to use rollup-plugin-vue. Use [NPM][NPM] or [yarn][yarn] to add `rollup-plugin-vue` as development dependency to your project.

### Using NPM
```
npm install --save-dev rollup-plugin-vue
```

### Using yarn
```
yarn add --dev rollup-plugin-vue
```

### Use plugin 
Next add `rollup-plugin-vue` to `rollup` plugins.

``` js
// rollup.config.js
import vue from 'rollup-plugin-vue';

export default {
  plugins: [
    vue(),
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
        - `options: { ?sass: Object, ?less: Object, ?cssModules: Object }` - Processing library configuration options.
        
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
It uses `node-sass@^4.5.0` to process `sass/scss` style elements. You can provide `node-sass` configuration options by ```scss: { /* node-sass options */}```.

- ##### Less
It uses `less@^2.7.2` to process `less` style elements. You can provide `less` configuration options by ```less: { /* node-sass options */}```.

<p class="tip" markdown="1">
`node-sass` and `less` are optional dependencies. If you are using `scss/sass/less` you should require (`yarn add --dev node-sass less`) them.
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

### Template

#### Template Languages

- ##### HTML

- ##### Pug/Jade

### Script

#### Script Languages

- ##### ES6/Babel

- ##### Coffee

### Custom template injection

### Handle with(this) issue

### include/exclude

[node]: http://nodejs.org/
[rollup]: http://rollupjs.org
[NPM]: https://www.npmjs.com/#getting-started
[yarn]: http://yarnpkg.com/
