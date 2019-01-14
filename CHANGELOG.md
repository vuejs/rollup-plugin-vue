# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="4.6.1"></a>
## [4.6.1](https://github.com/vuejs/rollup-plugin-vue/compare/v4.6.0...v4.6.1) (2019-01-14)


### Bug Fixes

* Clean dist directory ([9e348f3](https://github.com/vuejs/rollup-plugin-vue/commit/9e348f3))



<a name="4.6.0"></a>
# [4.6.0](https://github.com/vuejs/rollup-plugin-vue/compare/v4.5.0...v4.6.0) (2019-01-14)


### Features

* Migrate from tsc to rollup ([5ac7474](https://github.com/vuejs/rollup-plugin-vue/commit/5ac7474))



<a name="4.5.0"></a>
# [4.5.0](https://github.com/vuejs/rollup-plugin-vue/compare/v4.4.0...v4.5.0) (2019-01-14)


### Bug Fixes

* Use rollup's resolveId instead of require.resolve to resolve internal modules ([3fbc8eb](https://github.com/vuejs/rollup-plugin-vue/commit/3fbc8eb))


### Features

* Add beforeAssemble hook ([2ae1bbf](https://github.com/vuejs/rollup-plugin-vue/commit/2ae1bbf)), closes [#237](https://github.com/vuejs/rollup-plugin-vue/issues/237)



<a name="4.4.0"></a>
# 4.4.0 (2019-01-10)


### Bug Fixes

* **README:** logo URL ([#246](https://github.com/vuejs/rollup-plugin-vue/issues/246)) ([27bc6f8](https://github.com/vuejs/rollup-plugin-vue/commit/27bc6f8))
* Copy SFCDescriptor before further passing it to processors ([#243](https://github.com/vuejs/rollup-plugin-vue/issues/243)) ([3c1113b](https://github.com/vuejs/rollup-plugin-vue/commit/3c1113b))
* Throw style compilation errors ([#235](https://github.com/vuejs/rollup-plugin-vue/issues/235)) ([5d8aa49](https://github.com/vuejs/rollup-plugin-vue/commit/5d8aa49))



<a name="4.4.0-alpha.0"></a>
# [4.4.0-alpha.0](https://github.com/vuejs/rollup-plugin-vue/compare/v4.3.2...v4.4.0-alpha.0) (2018-08-29)


### Features

* Use runtime helper package instead of inline generated code ([3285740](https://github.com/vuejs/rollup-plugin-vue/commit/3285740))



<a name="4.3.2"></a>
## [4.3.2](https://github.com/vuejs/rollup-plugin-vue/compare/v4.3.1...v4.3.2) (2018-07-31)



<a name="4.3.1"></a>
## [4.3.1](https://github.com/vuejs/rollup-plugin-vue/compare/v4.3.0...v4.3.1) (2018-07-13)



<a name="4.3.0"></a>
# [4.3.0](https://github.com/vuejs/rollup-plugin-vue/compare/v4.2.0...v4.3.0) (2018-06-24)


### Bug Fixes

* Transform `require` in render function compiled from `<template>` ([#212](https://github.com/vuejs/rollup-plugin-vue/issues/212)) ([89839f2](https://github.com/vuejs/rollup-plugin-vue/commit/89839f2))


### Features

* Provide sourcemap for blocks in .vue file ([#215](https://github.com/vuejs/rollup-plugin-vue/issues/215)) ([a5928ad](https://github.com/vuejs/rollup-plugin-vue/commit/a5928ad))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/znck/rollup-plugin-vue/compare/v4.1.5...v4.2.0) (2018-05-25)


### Features

* Use regex to filter .vue files ([1c77e2a](https://github.com/znck/rollup-plugin-vue/commit/1c77e2a))



<a name="4.1.5"></a>
## [4.1.5](https://github.com/znck/rollup-plugin-vue/compare/v4.1.4...v4.1.5) (2018-05-25)


### Bug Fixes

* Handle Vue.extend constructor export from .vue file ([#206](https://github.com/znck/rollup-plugin-vue/issues/206)) ([fa7661e](https://github.com/znck/rollup-plugin-vue/commit/fa7661e))
* Resolve src attr value with require.resolve ([#205](https://github.com/znck/rollup-plugin-vue/issues/205)) ([ecb2d87](https://github.com/znck/rollup-plugin-vue/commit/ecb2d87))



<a name="4.1.4"></a>
## [4.1.4](https://github.com/znck/rollup-plugin-vue/compare/v4.1.3...v4.1.4) (2018-05-15)


### Bug Fixes

* Use named import querystring module ([#199](https://github.com/znck/rollup-plugin-vue/issues/199)) ([b3d63f0](https://github.com/znck/rollup-plugin-vue/commit/b3d63f0)), closes [#198](https://github.com/znck/rollup-plugin-vue/issues/198)


<a name="4.1.1"></a>
## [4.1.1](https://github.com/znck/rollup-plugin-vue/compare/v4.1.0...v4.1.1) (2018-05-12)


### Bug Fixes

* Change main file in package.json ([73f944c](https://github.com/znck/rollup-plugin-vue/commit/73f944c))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/znck/rollup-plugin-vue/compare/v4.0.2...v4.1.0) (2018-05-09)


### Bug Fixes

* Use file basename in vue block imports ([#192](https://github.com/znck/rollup-plugin-vue/issues/192)) ([05176a8](https://github.com/znck/rollup-plugin-vue/commit/05176a8)), closes [#181](https://github.com/znck/rollup-plugin-vue/issues/181) [#187](https://github.com/znck/rollup-plugin-vue/issues/187)


### Features

* Migrate codebase to typescript ([#191](https://github.com/znck/rollup-plugin-vue/issues/191)) ([758e330](https://github.com/znck/rollup-plugin-vue/commit/758e330))



<a name="4.0.2"></a>
## [4.0.2](https://github.com/znck/rollup-plugin-vue/compare/v4.0.1...v4.0.2) (2018-05-06)


### Bug Fixes

* When using extract CSS add scopeId to component for scoped CSS ([#188](https://github.com/znck/rollup-plugin-vue/issues/188)) ([3a64402](https://github.com/znck/rollup-plugin-vue/commit/3a64402)), closes [#186](https://github.com/znck/rollup-plugin-vue/issues/186)


### Features

* Improve compatibility with other plugins that uses query parameters ([#185](https://github.com/znck/rollup-plugin-vue/issues/185)) ([4110dbb](https://github.com/znck/rollup-plugin-vue/commit/4110dbb))



<a name="4.0.1"></a>
## [4.0.1](https://github.com/znck/rollup-plugin-vue/compare/v2.5.2...v4.0.1) (2018-05-02)


### Bug Fixes

* allow less which is empty or comments only ([#151](https://github.com/znck/rollup-plugin-vue/issues/151)) ([9387215](https://github.com/znck/rollup-plugin-vue/commit/9387215)), closes [#132](https://github.com/znck/rollup-plugin-vue/issues/132)
* edit example conf.js ([#161](https://github.com/znck/rollup-plugin-vue/issues/161)) ([f918a7f](https://github.com/znck/rollup-plugin-vue/commit/f918a7f))
* move vue-template-compiler to peer dependencies ([7c6c56a](https://github.com/znck/rollup-plugin-vue/commit/7c6c56a))
* Rollup CLI example ([#157](https://github.com/znck/rollup-plugin-vue/issues/157)) ([c7f25a9](https://github.com/znck/rollup-plugin-vue/commit/c7f25a9))
* use prepare instead of prepublish ([684de42](https://github.com/znck/rollup-plugin-vue/commit/684de42))


### Features

* add lang="postcss" on style tags ([#149](https://github.com/znck/rollup-plugin-vue/issues/149)) ([5ccea8d](https://github.com/znck/rollup-plugin-vue/commit/5ccea8d))
* Convert script & styles to import statements ([#184](https://github.com/znck/rollup-plugin-vue/issues/184)) ([2fddee1](https://github.com/znck/rollup-plugin-vue/commit/2fddee1)), closes [#183](https://github.com/znck/rollup-plugin-vue/issues/183) [#153](https://github.com/znck/rollup-plugin-vue/issues/153)
* Use [@vue](https://github.com/vue)/component-compiler ([#182](https://github.com/znck/rollup-plugin-vue/issues/182)) ([8409424](https://github.com/znck/rollup-plugin-vue/commit/8409424))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/znck/rollup-plugin-vue/compare/v2.5.2...v4.0.0) (2018-05-01)

### Features

* use [@vue](https://github.com/vue)/component-compiler ([e110aa0](https://github.com/znck/rollup-plugin-vue/commit/e110aa0))
