import {
  setWorldConstructor,
  World,
  IWorldOptions,
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
} from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { browserName, launchOptions, contextOptions, defaultTimeout } from '../playwright.config';
import * as fs from 'fs';
import * as path from 'path';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);

let browser: Browser;

BeforeAll({ timeout: 60000 }, async function () {
  const browsers = { chromium, firefox, webkit };
  browser = await browsers[browserName].launch(launchOptions);
});

Before(async function (this: CustomWorld) {
  this.browser = browser;
  this.context = await browser.newContext(contextOptions);
  this.context.setDefaultTimeout(defaultTimeout);
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, { result, pickle }) {
  if (result?.status === Status.FAILED) {
    const screenshotsDir = path.join('reports', 'screenshots');
    fs.mkdirSync(screenshotsDir, { recursive: true });
    const screenshotPath = path.join(screenshotsDir, `${pickle.name.replace(/\s+/g, '_')}_${Date.now()}.png`);
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    await this.attach(screenshot, 'image/png');
  }
  await this.context.close();
});

AfterAll(async function () {
  await browser.close();
});
