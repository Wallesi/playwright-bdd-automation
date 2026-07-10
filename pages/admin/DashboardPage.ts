import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DashboardPage extends BasePage {
  private readonly navbar: Locator;
  private readonly logoutButton: Locator;
  private readonly navLinks: Record<string, Locator>;

  constructor(page: Page) {
    super(page);
    this.navbar = page.locator('nav.navbar');
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    this.navLinks = {
      Rooms: page.locator('a.nav-link[href="/admin/rooms"]'),
      Report: page.locator('#reportLink'),
      Branding: page.locator('#brandingLink'),
      Messages: page.locator('a.nav-link[href="/admin/message"]'),
    };
  }

  async isLoaded(): Promise<boolean> {
    return this.isVisible(this.navbar);
  }

  async clickNavLink(section: string): Promise<void> {
    const link = this.navLinks[section];
    if (!link) throw new Error(`Unknown navbar section: ${section}`);
    await this.click(link);
  }

  async logout(): Promise<void> {
    await this.click(this.logoutButton);
  }
}
