# [6.0.0](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.11...v6.0.0) (2020-11-25)


### Features

* new script setup compatibility ([d1a528f](https://github.com/vuejs/rollup-plugin-vue/commit/d1a528f77e0ba2dd174c9bc7d46b1f1753a6a04c))
* support for new sfc experimental features ([d70f594](https://github.com/vuejs/rollup-plugin-vue/commit/d70f594f19087ed1440e44eb3f51e6b3ce1f298b)), closes [vuejs/rfcs#227](https://github.com/vuejs/rfcs/issues/227) [vuejs/rfcs#231](https://github.com/vuejs/rfcs/issues/231)



# [6.0.0-beta.11](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.9...v6.0.0-beta.11) (2020-11-02)


### Bug Fixes

* add language fallback for template code ([#407](https://github.com/vuejs/rollup-plugin-vue/issues/407)) ([e334e8c](https://github.com/vuejs/rollup-plugin-vue/commit/e334e8c1818cd85d6e8fa70e40ce357df02d4209))
* avoid adding render function when no template in an SFC ([#387](https://github.com/vuejs/rollup-plugin-vue/issues/387)) ([6960203](https://github.com/vuejs/rollup-plugin-vue/commit/6960203fdc4285b4322a2c4f061f4a2773d49c9c))
* avoid conflicting filename for sourcemaps ([#375](https://github.com/vuejs/rollup-plugin-vue/issues/375)) ([4ec1315](https://github.com/vuejs/rollup-plugin-vue/commit/4ec1315369c95c115c6271b6f93e1d9bf089c12f))
* default render function name for ssr ([#402](https://github.com/vuejs/rollup-plugin-vue/issues/402)) ([714afd7](https://github.com/vuejs/rollup-plugin-vue/commit/714afd7178abdf785f05c0657923732bdaf5a9dd))
* support options for template block preprocessor render ([#377](https://github.com/vuejs/rollup-plugin-vue/issues/377)) ([3222451](https://github.com/vuejs/rollup-plugin-vue/commit/3222451614e8c5e4c1c3188bd6388285a25851ba))


### Features

* add watchers to imports within vue files ([#385](https://github.com/vuejs/rollup-plugin-vue/issues/385)) ([cd41410](https://github.com/vuejs/rollup-plugin-vue/commit/cd414102bc503e74b9e17ad3b62e14f7dd33a18a))



# [6.0.0-beta.9](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.8...v6.0.0-beta.9) (2020-07-16)


### Features

* distinguish options for different CSS preprocessing languages ([#366](https://github.com/vuejs/rollup-plugin-vue/issues/366)) ([860595e](https://github.com/vuejs/rollup-plugin-vue/commit/860595e1132d284a40b4f54bc22401bd67046bc7))



# [6.0.0-beta.8](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.7...v6.0.0-beta.8) (2020-07-15)


### Bug Fixes

* backwards compat with older versions of compiler-sfc ([7cb9fa4](https://github.com/vuejs/rollup-plugin-vue/commit/7cb9fa4fb6789a8d70de3204243e3d2a7043ab59))



# [6.0.0-beta.7](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.6...v6.0.0-beta.7) (2020-07-15)


### Features

* `<script setup>` support ([8298f71](https://github.com/vuejs/rollup-plugin-vue/commit/8298f7178de9d3621dcd069f9f6eaa8e5d9e40ef))
* support `<style vars>` ([8921740](https://github.com/vuejs/rollup-plugin-vue/commit/89217405d3e61153901b4bae6eeb0c91c40854f2))



# [6.0.0-beta.6](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.5...v6.0.0-beta.6) (2020-06-05)


### Features

* pass on postcss options to compiler-sfc ([d1332af](https://github.com/vuejs/rollup-plugin-vue/commit/d1332af7c42c55102db13da3d7e8a284806f5121))



# [6.0.0-beta.5](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.4...v6.0.0-beta.5) (2020-06-04)


### Features

* css preprocess options ([#360](https://github.com/vuejs/rollup-plugin-vue/issues/360)) ([f8a7254](https://github.com/vuejs/rollup-plugin-vue/commit/f8a7254f41c1e3242b678af29f73ec3ab06a769c))



# [6.0.0-beta.4](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.3...v6.0.0-beta.4) (2020-06-02)


### Bug Fixes

* load custom blocks by index ([0720102](https://github.com/vuejs/rollup-plugin-vue/commit/0720102dd5d023a19bb720329cc84d91c5d88f7c)), closes [#355](https://github.com/vuejs/rollup-plugin-vue/issues/355)



# [6.0.0-beta.3](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.2...v6.0.0-beta.3) (2020-05-27)


### Bug Fixes

* properly handle non-script src imports ([6e4a025](https://github.com/vuejs/rollup-plugin-vue/commit/6e4a025dbe110027f38ec583182254d2845e338f))



# [6.0.0-beta.2](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-beta.1...v6.0.0-beta.2) (2020-05-27)


### Bug Fixes

* add extension to Vue block URI ([#352](https://github.com/vuejs/rollup-plugin-vue/issues/352)) ([74b8f6e](https://github.com/vuejs/rollup-plugin-vue/commit/74b8f6eba39e1146b944417221b163833567b8a2))
* fix filtering for src imports in resolveId ([7dd895d](https://github.com/vuejs/rollup-plugin-vue/commit/7dd895dcf61ca1077cb63c7125214ac36950723f))
* let rollup resolve src imports ([5e5a2af](https://github.com/vuejs/rollup-plugin-vue/commit/5e5a2af3c83d0bd70f3214a35071c8a06f40906c))


### Features

* process custom blocks ([#354](https://github.com/vuejs/rollup-plugin-vue/issues/354)) ([5636947](https://github.com/vuejs/rollup-plugin-vue/commit/56369477c56643fea9111b4a3d86bfdb2a44f23a))



# [6.0.0-beta.1](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.10...v6.0.0-beta.1) (2020-05-19)


### Bug Fixes

* fix css modules code missing newline ([51fdbcc](https://github.com/vuejs/rollup-plugin-vue/commit/51fdbcc67da93707aa001eede4fd6894d4a5851b))
* pass template in map ([a13bed4](https://github.com/vuejs/rollup-plugin-vue/commit/a13bed48c821d0a8d0e73dd40d2b1b3ff6e8608b))



# [6.0.0-alpha.10](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.9...v6.0.0-alpha.10) (2020-05-07)


### Features

* support src imports ([69f9106](https://github.com/vuejs/rollup-plugin-vue/commit/69f9106424e92b25d771640146248f71d9835229))



# [6.0.0-alpha.9](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.8...v6.0.0-alpha.9) (2020-05-07)



# [6.0.0-alpha.8](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.7...v6.0.0-alpha.8) (2020-05-05)


### Bug Fixes

* pass preprocessCustomRequire to compileTemplate ([2330d03](https://github.com/vuejs/rollup-plugin-vue/commit/2330d0330276316e5248087bf0fc3c0b9f24f89b))



# [6.0.0-alpha.7](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.6...v6.0.0-alpha.7) (2020-05-01)


### Bug Fixes

* remove unnecessary defineComponent call ([43b11c6](https://github.com/vuejs/rollup-plugin-vue/commit/43b11c69542e64b729468bf5a72ade36b11f0f80))



# [6.0.0-alpha.6](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.5...v6.0.0-alpha.6) (2020-04-29)


### Features

* properly support ssr when target === "node" ([3a604c9](https://github.com/vuejs/rollup-plugin-vue/commit/3a604c94468bf8ed3c34bc1e6248f21bbe12704c))



# [6.0.0-alpha.5](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.4...v6.0.0-alpha.5) (2020-04-26)



# [6.0.0-alpha.4](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.3...v6.0.0-alpha.4) (2020-04-24)


### Features

* add `preprocessStyles` option (defaults to false) ([50a7d78](https://github.com/vuejs/rollup-plugin-vue/commit/50a7d784806e74b65486119854d466e73fdbf74a))
* support css preprocessors ([88da113](https://github.com/vuejs/rollup-plugin-vue/commit/88da11321cd48abd6398f3c934f7274b57296fc3))



# [6.0.0-alpha.3](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.2...v6.0.0-alpha.3) (2020-04-24)


### Features

* support css modules ([87a6150](https://github.com/vuejs/rollup-plugin-vue/commit/87a61504b8f541acb0642fb917b692c07b8eb938))



# [6.0.0-alpha.2](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.1...v6.0.0-alpha.2) (2020-04-24)


### Bug Fixes

* should provide scope id to template compilation ([2c0459c](https://github.com/vuejs/rollup-plugin-vue/commit/2c0459cede04be69c8fbf0c49dacb4c178ae913f))



# [6.0.0-alpha.1](https://github.com/vuejs/rollup-plugin-vue/compare/v6.0.0-alpha.0...v6.0.0-alpha.1) (2020-04-03)


### Bug Fixes

* use default export mode for commonjs build ([d1e77ff](https://github.com/vuejs/rollup-plugin-vue/commit/d1e77ffacadd33d02007e30e3b4c3ec261e8e09b))



# [6.0.0-alpha.0](https://github.com/vuejs/rollup-plugin-vue/compare/bcf9ed97643da37906aa49e818180ebcba48e447...v6.0.0-alpha.0) (2020-04-03)


### Bug Fixes

* use verbose template sourcemap for better sourcemap support ([ffe1f8e](https://github.com/vuejs/rollup-plugin-vue/commit/ffe1f8ed63e185816f0b06fc0c7dc3fd564b0761))
* use verbose template sourcemap for better sourcemap support ([fb31eed](https://github.com/vuejs/rollup-plugin-vue/commit/fb31eede1687d39b3910b50a6b08d88a9ceb2371))
* use verbose template sourcemap for better sourcemap support ([bcf9ed9](https://github.com/vuejs/rollup-plugin-vue/commit/bcf9ed97643da37906aa49e818180ebcba48e447))



