module.exports = {
  displayName: 'strict',
  collectCoverageFrom: ['<rootDir>/app/scripts/controllers/permissions/*.js'],
  coverageDirectory: './jest-coverage/strict/',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: {
    './app/scripts/controllers/permissions/*.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/test/setup.js', '<rootDir>/test/env.js'],
  setupFilesAfterEnv: ['<rootDir>/test/jest/setup.js'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/app/scripts/controllers/permissions/*.test.js'],
  testTimeout: 2500,
};
