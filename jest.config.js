const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  coveragePathIgnorePatterns: ['.*\\.spec\\.ts'],
  globals: {
    'ts-jest': {
      packageJson: '<rootDir>/package.json',
    },
    __DEV__: false,
  },
}
