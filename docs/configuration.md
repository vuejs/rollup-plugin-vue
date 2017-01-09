# Configuration
For most cases `rollup-plugin-vue` works out of the box. But, you can always configure it to your needs.

Following configuration are available to be overridden.

 Option                             | Vue 0.11 | Vue 0.12 | Vue 1.0 | Vue 2.0
------------------------------------|:--------:|:--------:|:-------:|:-------:
[css](#css)                         | &check;  | &check;  | &check; | &check;
[compileTemplate](#compileTemplate) | -        | -        | -       | &check;
[styleToImports](#styleToImports)   | &check;  | &check;  | &check; | &check;
[stripWith](#stripWith)             | -        | -        | -       | &check;
[include](#exclude)                 | &check;  | &check;  | &check; | &check;
[exclude](#exclude)                 | &check;  | &check;  | &check; | &check;
[htmlMinifier](#htmlMinifier)       | &check;  | &check;  | &check; | &check;
[vue](#vue)                         | &check;  | &check;  | &check; | &check;
[inject](#vue)                      | &check;  | &check;  | &check; | &check;

{#css}
### The `css` option

It accepts a filename, `false`, `null` or a `Function`.

- **`null`** -- If your rollup config defines `dest` then it would generate a css file with same name as defined in `dest`, else a file named `bundle.css` is generated. This is the default behavior.

  Following script would export styles to `dist/my-package.css`.
  ``` js
  // rollup.plugin.js
  import vue from 'rollup-plugin-vue';

  export default {
    entry: 'src/index.js',
    dest: 'dist/my-package.js',
    plugins: [
      vue({ css: null }), // or  vue()
    ],
  };
  ```
- **filename** -- Combined css styles are exported to this file.

  Following script would export styles to `dist/styles.scss`.
  ``` js
  // rollup.plugin.js
  import vue from 'rollup-plugin-vue';

  export default {
    entry: 'src/index.js',
    dest: 'dist/my-package.js',
    plugins: [
      vue({ css: 'dist/styles.scss' }),
    ],
  };
  ```
- **`false`** -- Ignore all styles.

  Following script would not export styles at all.
  ``` js
  // rollup.plugin.js
  import vue from 'rollup-plugin-vue';

  export default {
    entry: 'src/index.js',
    dest: 'dist/my-package.js',
    plugins: [
      vue({ css: false }),
    ],
  };
  ```

- **`Function`** -- In a custom style handler function you can do what ever you want.

  The `css` handler would receive 2 parameters.
    - content (String) -- A string containing content of all style tags across all .vue files.
    - styles (Array) -- An array containing all style nodes. A node is of following format.
      ``` js
      {
        id: String, // Absolute file path of the component.
        code: String, // Content of the style tag.
        lang: String, // Language defined by lang attribute on style tag. (Default: css)
      }
      ```

  Following script would generate `.scss` file for every component.
  ``` js
  // rollup.plugin.js
  import vue from 'rollup-plugin-vue';
  import fs from 'fs';
  import path from 'path';

  export default {
    entry: 'src/index.js',
    dest: 'dist/my-package.js',
    plugins: [
      vue({
        css(content, styles) {
          // ¯\_(ツ)_/¯ do whatever you want to do.
          styles.forEach(({ id, content }) => {
            const filename = path.basename(id).replace(/\.vue$/, '.scss');

            fs.writeFileSync(`dist/scss/${filename}`, content);
          });
        },
      }),
    ],
  };
  ```

{#compileTemplate}
### The `compileTemplate` option

With Vue 2.0, you can have [two builds](https://vuejs.org/v2/guide/installation.html#Standalone-vs-Runtime-only-Build); Runtime-only and Standalone.
Runtime-only build does not include template compiler. So, it is required compile `template` string to `render` function.

This option takes `boolean` value.
  - `true` -- Always compile to `render` function.
  - `false` -- Do not compile `template` string.
  - You can ignore this option at all.

**NOTE:** If `compileTemplate` is not set and Vue 2.0 is in project dependencies, then it would compile to `template` to `render` function.

{#styleToImports}
### The `styleToImports` option
> [WIP]

{#stripWith}
### The `stripWith` option
> [WIP]

{#include}
### The `include` option
> [WIP]


{#exclude}
### The `exclude` option
> [WIP]

{#htmlMinifier}
### The `htmlMinifier` option
> [WIP]

{#vue}
### The `vue` option
> [WIP]

{#inject}
### The `inject` option
> [WIP]


<br><br><br>

-------------------------------
[Edit this page on Github]({{ $docs_edit_url }}/configuration.md)
[Examples]({{ $docs_url }}/examples){.float-xs-right.pl-1}
