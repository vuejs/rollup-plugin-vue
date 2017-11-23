Simple example
===

Example bundling an UMD package with one `.vue` file and exporting Stylus and CSS (both minified and unminified) to different files.

## Building

### With build script

```
cd example
node build.js
ls dist
```

### With Rollup CLI

```
cd example
npm i -g rollup
rollup -c --input Hello.vue --output dist/bundle.js
```
