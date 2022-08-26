const config = require('../jest.config');

const e2eConfig = {
  ...config,
  testRegex: '.e2e-spec.ts$',
};

delete e2eConfig.collectCoverageFrom;
delete e2eConfig.coverageThreshold;
delete e2eConfig.coverageDirectory;

module.exports = e2eConfig;
