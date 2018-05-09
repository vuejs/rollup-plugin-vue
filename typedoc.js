const { version } = require('./package.json')

module.exports = {
  out: 'docs/',
  excludeExternals: true,
  excludePrivate: true,
  mode: 'file',
  hideGenerator: true,
  gitRevision: 'v' + version,
  exclude: ['src/utils.ts']
}