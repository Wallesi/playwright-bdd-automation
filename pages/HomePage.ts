import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private readonly welcomeHeading: Locator;
  private readonly bookNowButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeading = page.getByRole('heading', { level: 1, name: 'Welcome to Shady Meadows B&B' });
    this.bookNowButton = page.getByRole('link', { name: 'Book Now', exact: true });
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async getWelcomeHeadingText(): Promise<string> {
    return this.getText(this.welcomeHeading);
  }

  async isWelcomeHeadingVisible(): Promise<boolean> {
    return this.isVisible(this.welcomeHeading);
  }

  async isBookNowButtonVisible(): Promise<boolean> {
    return this.isVisible(this.bookNowButton);
  }

  async isBookNowButtonEnabled(): Promise<boolean> {
    await this.waitForVisible(this.bookNowButton);
    return this.bookNowButton.isEnabled();
  }
}
