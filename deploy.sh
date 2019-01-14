#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run :build:docs

# navigate into the build output directory
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:vuejs/rollup-plugin-vue.git master:gh-pages
cd -
