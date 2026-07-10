import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LandingPage extends BasePage {
  private readonly navLinks: Record<string, Locator>;

  constructor(page: Page) {
    super(page);
    this.navLinks = {
      Rooms: page.locator('a.nav-link[href="/#rooms"]'),
      Location: page.locator('a.nav-link[href="/#location"]'),
    };
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async clickNavLink(section: string): Promise<void> {
    const link = this.navLinks[section];
    if (!link) throw new Error(`Unknown section: ${section}`);
    await this.click(link);
  }

  getSectionHeading(heading: string): Locator {
    return this.page.locator('h2.display-5', { hasText: heading });
  }
}
