<div class="text-xs-center" align="center" style="margin: 20px">
  <img src="https://raw.githubusercontent.com/vuejs/rollup-plugin-vue/master/logo.png">
</div>

## Introduction

As vue-loader is for webpack and vueify is for browserify, similarly its for rollup. As we know, webpack and browserify concat stuff and make it runnable in browser. Its difficult to share .vue components. **Now roll your [Vue](http://vuejs.org/) components.**

With rollup you can break your application into reusable modules.

<p align="center">
  <a href="https://circleci.com/gh/vuejs/rollup-plugin-vue">
    <img src="https://circleci.com/gh/vuejs/rollup-plugin-vue.svg?style=svg" alt="Build Status" />
  </a>
  <a href="https://coveralls.io/github/znck/rollup-plugin-vue?branch=master">
    <img src="https://coveralls.io/repos/github/znck/rollup-plugin-vue/badge.svg?branch=master&style=flat-square" alt="Coverage Status" />
  </a>
</p>

## Usage

> This document applies to v4.0+. If you are looking for older versions, docs are [here](https://github.com/vuejs/rollup-plugin-vue/tree/2.2/docs)

```js
import VuePlugin from 'rollup-plugin-vue'

export default {
  entry: 'main.js',
  plugins: [VuePlugin(/* VuePluginOptions */)]
}
```

## Security

If you discover any security related issues, please email hi@znck.me instead of using the issue tracker.

## Credits

* [Rahul Kadyan](https://github.com/znck)
* [Thomas Ghysels](https://github.com/thgh)
* [Eduardo San Martin Morote](https://github.com/posva)
* [All Contributors][link-contributors]

## License

The MIT License (MIT). Please see [License File](http://znck.me/rollup-plugin-vue/license) for more information.

[link-contributors]: https://github.com/znck/rollup-plugin-vue/graphs/contributors
