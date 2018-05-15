module.exports = {
  collectCoverageFrom: ['src/**'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  transform: {
    '^.+\\.ts$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
  },
  testMatch: ['**/?(*.)spec.ts'],
  testEnvironment: 'node'
}
