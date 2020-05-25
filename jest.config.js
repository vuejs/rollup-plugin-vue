const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      packageJson: '<rootDir>/package.json',
    },
    __DEV__: false,
  },
}
