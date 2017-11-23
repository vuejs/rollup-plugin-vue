---
sidebar: false

---

<div class="text-xs-center" align="center" style="margin: 20px">
  <img src="./assets/images/logo.png">
</div>

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

## Introduction
`rollup-plugin-vue` is a plugin for Rollup that can transform Vue components in the following format into a plain JavaScript module:

<div class="text-xs-center" align="center" style="margin: 0 20px">
  <img src="./assets/images/vue-component.png">
</div>

There are many cool features provided by `rollup-plugin-vue`:
- ES2015 enabled by default
- Built-in support for Sass, Less and Stylus for `<style>`
- Built-in support for Pug for `<template>`

In a nutshell, the combination of Rollup and `rollup-plugin-vue` gives you a modern, flexible, and extremely powerful workflow for authoring Vue.js components & plugins.

<p class="tip">
This plugin is best for authoring component modules and plugins. Use webpack and [vue-loader](http://vue-loader.vuejs.org) for authoring Vue.js applications.
</p>
