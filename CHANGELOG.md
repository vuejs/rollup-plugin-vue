# Changelog

All Notable changes to `rollup-plugin-vue` will be documented in this file.

## [Unreleased]

### Fixed
- `vue-template-compiler` is now a peer dependency instead of a direct dependency. This allows the user to pin `vue-template-compiler` to a specific version instead of relying on the implicit upgrades from a semver caret range.

## [Version 2.2.15][2.2.15] - 2017-01-10

### Added
- Installation and configuration [docs](http://znck.me/rollup-plugin-vue)

### Fixed
- Write styles to `bundle.css` by default (#49)

## [Version 2.0][2.0.0]

### Added
- Compile *.vue files.

[Unreleased]: https://github.com/znck/rollup-plugin-vue/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/znck/rollup-plugin-vue/compare/v1.0.3...v2.0.0
[2.2.15]: https://github.com/znck/rollup-plugin-vue/compare/v2.2.14...v2.2.15

