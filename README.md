# rollup-plugin-vue ![](https://circleci.com/gh/znck/rollup-plugin-vue.svg?style=shield&circle-token=:8f5a3f8b258950508dfe8574a46d9ba2de67f2d2)

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
