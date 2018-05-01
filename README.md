<div class="text-xs-center" align="center" style="margin: 20px">
  <img src="docs/assets/images/logo.png">
</div>

## Introduction
As vue-loader is for webpack and vueify is for browserify, similarly its for rollup. As we know, webpack and browserify concat stuff and make it runnable in browser. Its difficult to share .vue components. **Now roll your [Vue](http://vuejs.org/) components.**

With rollup you can break your application into reusable modules.

<p align="center">
  <a href="https://circleci.com/gh/vuejs/rollup-plugin-vue">
    <img src="https://circleci.com/gh/vuejs/rollup-plugin-vue.svg?style=svg" alt="Build Status" />
  </a>
  <a href="http://standardjs.com">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="Code Style" />
  </a>
  <a href="https://coveralls.io/github/znck/rollup-plugin-vue?branch=master">
    <img src="https://coveralls.io/repos/github/znck/rollup-plugin-vue/badge.svg?branch=master&style=flat-square" alt="Coverage Status" />
  </a>
  <a href="https://www.codacy.com/app/vuejs/rollup-plugin-vue">
    <img src="https://api.codacy.com/project/badge/grade/e3402df0135240c29a1d25bab93932a0"/>
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square" alt="Software License" />
  </a>
  <a href="https://npmjs.org/package/rollup-plugin-vue">
    <img src="https://img.shields.io/npm/v/rollup-plugin-vue.svg?style=flat-square" alt="NPM" />
  </a>
  <a href="https://github.com/vuejs/rollup-plugin-vue/releases">
    <img src="https://img.shields.io/github/release/vuejs/rollup-plugin-vue.svg?style=flat-square" alt="Latest Version" />
  </a>

  <a href="https://github.com/vuejs/rollup-plugin-vue/issues">
    <img src="https://img.shields.io/github/issues/vuejs/rollup-plugin-vue.svg?style=flat-square" alt="Issues" />
  </a>
</p>

## Usage

```js
import vue from 'rollup-plugin-vue'

export default  {
  entry: 'main.js',
  plugins: [
    vue(/* options */)
  ]
}
``` 

## Security

If you discover any security related issues, please email hi@znck.me instead of using the issue tracker.

## Credits

- [Rahul Kadyan](https://github.com/znck)
- [Thomas Ghysels](https://github.com/thgh)
- [Eduardo San Martin Morote](https://github.com/posva)
- [All Contributors][link-contributors]

## License

The MIT License (MIT). Please see [License File](http://znck.me/rollup-plugin-vue/license) for more information.

[link-contributors]: https://github.com/znck/rollup-plugin-vue/graphs/contributors
