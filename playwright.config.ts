import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

type BrowserName = 'chromium' | 'firefox' | 'webkit';

const browserName: BrowserName = (process.env.BROWSER as BrowserName) || 'chromium';

const devicesByBrowser: Record<BrowserName, (typeof devices)[string]> = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
};

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.steps.ts',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['playwright-bdd/reporter/cucumber', { $type: 'html', outputFile: 'cucumber-report/index.html' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    headless: process.env.HEADLESS ? process.env.HEADLESS === 'true' : true,
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
    actionTimeout: process.env.TIMEOUT ? Number(process.env.TIMEOUT) : 30000,
    trace: 'on',
    screenshot: 'on',
    video: process.env.VIDEO === 'true' ? 'on' : 'retain-on-failure',
    launchOptions: {
      slowMo: process.env.SLOWMO ? Number(process.env.SLOWMO) : 0,
    },
  },
  projects: [
    {
      name: browserName,
      use: { ...devicesByBrowser[browserName] },
    },
  ],
});
