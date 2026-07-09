import 'dotenv/config';
import { LaunchOptions, BrowserContextOptions } from '@playwright/test';

/**
 * Cucumber drives its own test runner, so this file is not consumed by the
 * @playwright/test runner. It centralizes browser/context settings that
 * fixtures/testSetup.ts reads when launching the browser for each scenario.
 */
type BrowserName = 'chromium' | 'firefox' | 'webkit';

export const browserName: BrowserName = (process.env.BROWSER as BrowserName) || 'chromium';

export const launchOptions: LaunchOptions = {
  headless: process.env.HEADLESS ? process.env.HEADLESS === 'true' : true,
  slowMo: process.env.SLOWMO ? Number(process.env.SLOWMO) : 0,
};

export const contextOptions: BrowserContextOptions = {
  baseURL: process.env.BASE_URL || 'https://example.com',
  viewport: { width: 1366, height: 768 },
  ignoreHTTPSErrors: true,
  recordVideo: process.env.VIDEO === 'true' ? { dir: 'reports/videos' } : undefined,
};

export const defaultTimeout = process.env.TIMEOUT ? Number(process.env.TIMEOUT) : 30000;
