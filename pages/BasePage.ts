import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  async click(locator: Locator): Promise<void> {
    await this.waitForVisible(locator);
    await locator.click();
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    return (await locator.textContent())?.trim() ?? '';
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  get title(): Promise<string> {
    return this.page.title();
  }
}
