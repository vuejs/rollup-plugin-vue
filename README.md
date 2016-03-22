# Rollup Plugin for Vue
As vue-loader is for webpack and vueify is for browserify, similarly its for rollup. As we know, webpack and browserify concat stuff and make it runnable in browser. Its difficult to share .vue components. **Now roll your [Vue](http://vuejs.org/) components.**

With rollup you can break your application into reusable modules.

![Rollup Plugin for Vue](cover.png)

<p align="center">
  <a href="https://circleci.com/gh/znck/rollup-plugin-vue">
    <img src="https://circleci.com/gh/znck/rollup-plugin-vue.svg?style=svg" alt="Build Status" />
  </a>
  <a href="https://coveralls.io/github/znck/rollup-plugin-vue?branch=master">
    <img src="https://coveralls.io/repos/github/znck/rollup-plugin-vue/badge.svg?branch=master&style=flat-square" alt="Coverage Status" />
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

### Installation
[Node](http://nodejs.org/) and [Rollup](http://rollupjs.org) are required.
```
npm install --save-dev rollup-plugin-vue
```

### Usage

```js
import {rollup} from 'rollup';
import vue from 'rollup-plugin-vue';

rollup({
	entry: 'index.js',
	plugins: [vue()]
});
```

### Development milestones
- [x] Basic *.vue files (ES6 script, html template and no style tag.)
- [ ] Include style.
- [ ] Trans-compiler for script: coffee etc.
- [ ] Scoped css.
- [ ] Import script or template.

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
- [All Contributors][link-contributors]

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

[link-author]: https://github.com/:author_username
[link-contributors]: ../../contributors
