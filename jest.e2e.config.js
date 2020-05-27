const config = require('./jest.config')

module.exports = {
  ...config,
  testMatch: ['**/*.e2e.ts'],
}
