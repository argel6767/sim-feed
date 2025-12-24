module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['lcov', 'text'],
  testResultsProcessor: 'jest-junit',
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/__tests__/', '/src/dev-server.ts'],
};