const common = [
  'features/**/*.feature',
  '--require-module ts-node/register',
  '--require-module tsconfig-paths/register',
  '--require support/**/*.ts',
  '--require steps/**/*.steps.ts',
  '--format progress',
  '--format json:reports/cucumber-report.json',
  '--format html:reports/cucumber-report.html',
  '--publish-quiet',
].join(' ');

module.exports = {
  default: common,
};
