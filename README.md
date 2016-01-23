# rollup-plugin-vue

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