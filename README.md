# Rollup Plugin for Vue
As vue-loader is for webpack and vueify is for browserify, similarly its for rollup. As we know, webpack and browserify concat stuff and make it runnable in browser. Its difficult to share .vue components. **Now roll your [Vue](http://vuejs.org/) components.**

With rollup you can break your application into reusable modules.

> Working on next version. [See changes](https://github.com/znck/rollup-plugin-vue/compare/v1.0.3...HEAD)
> ## Development milestones
- [x] Basic *.vue files (ES6 script, html template and no style tag.)
- [ ] Include style.
- [ ] Trans-compiler for script: coffee etc.
- [ ] Scoped css.
- [ ] Import script or template.

![Rollup Plugin for Vue](cover.png)

<p align="center">
  <a href="https://circleci.com/gh/znck/rollup-plugin-vue">
    <img src="https://circleci.com/gh/znck/rollup-plugin-vue.svg?style=svg" alt="Build Status" />
  </a>
  <a href="https://coveralls.io/github/znck/rollup-plugin-vue?branch=master">
    <img src="https://coveralls.io/repos/github/znck/rollup-plugin-vue/badge.svg?branch=master&style=flat-square" alt="Coverage Status" />
  </a>
  <a href="https://www.codacy.com/app/znck/rollup-plugin-vue">
    <img src="https://api.codacy.com/project/badge/grade/e3402df0135240c29a1d25bab93932a0"/>
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square" alt="Software License" />
  </a>
  <a href="https://npmjs.org/package/rollup-plugin-vue">
    <img src="https://img.shields.io/npm/v/rollup-plugin-vue.svg?style=flat-square" alt="NPM" />
  </a>
  <a href="https://github.com/znck/rollup-plugin-vue/releases">
    <img src="https://img.shields.io/github/release/znck/rollup-plugin-vue.svg?style=flat-square" alt="Latest Version" />
  </a>

  <a href="https://github.com/znck/rollup-plugin-vue/issues">
    <img src="https://img.shields.io/github/issues/znck/rollup-plugin-vue.svg?style=flat-square" alt="Issues" />
  </a>
</p>

## Installation
[Node](http://nodejs.org/) and [Rollup](http://rollupjs.org) are required.
```
npm install --save-dev rollup-plugin-vue
```

## Usage

```js
import {rollup} from 'rollup';
import vue from 'rollup-plugin-vue';

rollup({
	entry: 'index.js',
	plugins: [vue()]
});
```

Below is how you can use it from the command line with Bublé.
Run `rollup -c` and it will find the config.

```js
// rollup.config.js
import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble' // rollup-plugin-babel also works

export default {
  entry: 'index.js',
  plugins: [
    vue(),
    buble()
  ]
}
```

### Options

```js
vue({
  // Filename to write all styles to
  css: 'bundle.scss',

  // Callback that will be called ongenerate with two arguments:
  // - styles: the contents of all style tags combined
  // - styleNodes: an array of style objects: [{lang: 'css', content: 'body { color: green }'}]
  css: function (styles, styleNodes) {
    writeFileSync(cssPath, styles)
  }

  // Disable any style output or callbacks
  css: false,

  // Default behaviour is to write all styles to the bundle destination where .js is replaced by .css
  css: null
})
```

## Change log

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Testing

``` bash
$ npm run test
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and [CONDUCT](CONDUCT.md) for details.

## Security

If you discover any security related issues, please email hi@znck.me instead of using the issue tracker.

## Credits

- [Rahul Kadyan][link-author]
- [Thomas Ghysels](https://github.com/thgh)
- [All Contributors][link-contributors]

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

[link-author]: https://github.com/:author_username
[link-contributors]: ../../contributors
