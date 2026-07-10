module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register', 'tsconfig-paths/register'],
    require: ['support/**/*.ts', 'steps/**/*.steps.ts'],
    format: ['progress', 'json:reports/cucumber-report.json', 'html:reports/cucumber-report.html'],
  },
};
