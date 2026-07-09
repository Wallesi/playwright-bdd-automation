const report = require('multiple-cucumber-html-reporter');
const os = require('os');

report.generate({
  jsonDir: 'reports',
  reportPath: 'reports/html-report',
  metadata: {
    browser: {
      name: process.env.BROWSER || 'chromium',
    },
    device: os.hostname(),
    platform: {
      name: os.platform(),
      version: os.release(),
    },
  },
  customData: {
    title: 'Run info',
    data: [
      { label: 'Project', value: 'playwright-automation' },
      { label: 'Execution', value: new Date().toISOString() },
    ],
  },
});
