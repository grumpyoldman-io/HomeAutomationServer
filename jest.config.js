const { resolve } = require('node:path');

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: { '@mocks/(.*)$': resolve(__dirname, 'mocks/$1') },
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/{!(main),}.(t|j)s'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
