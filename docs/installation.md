# Installation
[Node][node] and [Rollup][rollup] are required to use rollup-plugin-vue. Use [NPM][NPM] or [yarn][yarn] to add `rollup-plugin-vue` as development dependency to your project.

{#npm}
### [](#npm) Using NPM
```
npm install --save-dev rollup-plugin-vue
```

{#yarn}
### [](#yarn) Using yarn
```
yarn add --dev rollup-plugin-vue
```

### Next add `rollup-plugin-vue` to `rollup` plugins.

``` js
// rollup.config.js
import vue from 'rollup-plugin-vue';

export default {
  plugins: [
    vue(),
  ],
};
```

### :+1: All set.
  

-------------------------------
[Edit this page on Github]({{ $docs_edit_url }}/configuration.md)
[Configuration]({{ $docs_url }}/configuration){.float-xs-right.pl-1}

[node]: http://nodejs.org/
[rollup]: http://rollupjs.org
[NPM]: https://www.npmjs.com/#getting-started
[yarn]: http://yarnpkg.com/
