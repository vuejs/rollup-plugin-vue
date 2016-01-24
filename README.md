# rollup-plugin-vue [![circleci](https://circleci.com/gh/znck/rollup-plugin-vue.svg?style=shield&circle-token=:8f5a3f8b258950508dfe8574a46d9ba2de67f2d2)](https://circleci.com/gh/znck/rollup-plugin-vue) [![npm](https://img.shields.io/npm/v/rollup-plugin-vue.svg)](https://www.npmjs.com/package/rollup-plugin-vue) [![Coveralls](https://img.shields.io/coveralls/znck/rollup-plugin-vue.svg)](https://coveralls.io/github/znck/rollup-plugin-vue)

Roll .vue files

### Installation

```
npm install --save-dev rollup rollup-plugin-vue
```

### Configuration

```js
import {rollup} from 'rollup';
import vue from 'rollup-plugin-vue';

rollup({
	entry: 'index.js',
	plugins: [vue()]
});
```

### Limitations

- Multiple script tags not working.
