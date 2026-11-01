module.exports = {
  ...require('./jest.config.cjs'),
  testMatch: ['<rootDir>/tests/baseline/**/*.test.js'],
  coverageDirectory: 'coverage/baseline',
};
