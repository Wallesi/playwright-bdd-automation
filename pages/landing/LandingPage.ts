import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LandingPage extends BasePage {
  private readonly nav: Locator;
  private readonly navLinks: Record<string, Locator>;

  constructor(page: Page) {
    super(page);
    this.nav = page.getByRole('navigation');
    this.navLinks = {
      Rooms: this.robustLocator(page.locator('a[href="/#rooms"]'), page.locator('a.nav-link[href="/#rooms"]')),
      Location: this.robustLocator(page.locator('a[href="/#location"]'), page.locator('a.nav-link[href="/#location"]')),
    };
  }

  async isLoaded(): Promise<void> {
    await this.waitForVisible(this.nav);
  }

  async open(): Promise<void> {
    await this.goto('/');
    await this.isLoaded();
  }

  async clickNavLink(section: string): Promise<void> {
    const link = this.navLinks[section];
    if (!link) throw new Error(`Unknown section: ${section}`);
    await this.click(link);
  }

  getSectionHeading(heading: string): Locator {
    return this.page.locator('h2.display-5', { hasText: heading });
  }

  private getRoomCard(room: string): Locator {
    return this.page
      .locator('.room-card')
      .filter({ has: this.page.locator('h5.card-title', { hasText: new RegExp(`^${room}$`) }) });
  }

  async clickBookNow(room: string): Promise<void> {
    await this.click(this.getRoomCard(room).getByRole('link', { name: 'Book now' }));
  }
}
