module.exports = {
  collectCoverageFrom: ['src/**'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/*.spec.ts'],
  testEnvironment: 'node'
}
