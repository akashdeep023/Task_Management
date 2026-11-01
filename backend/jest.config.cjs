module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.cjs'],
  clearMocks: true,
  collectCoverageFrom: [
    'config/*.js',
    'controllers/*.js',
    'middlewares/*.js',
    'models/*.js',
    'server.js',
  ],
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text', 'html', 'lcov', 'json', 'json-summary'],
};
