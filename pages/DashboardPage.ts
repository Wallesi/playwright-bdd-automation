import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private readonly welcomeBanner: Locator;
  private readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeBanner = page.getByTestId('welcome-banner');
    this.logoutButton = page.getByRole('button', { name: 'Log out' });
  }

  async isLoaded(): Promise<boolean> {
    return this.isVisible(this.welcomeBanner);
  }

  async getWelcomeText(): Promise<string> {
    return this.getText(this.welcomeBanner);
  }

  async logout(): Promise<void> {
    await this.click(this.logoutButton);
  }
}
