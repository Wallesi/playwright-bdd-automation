import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RoomDetailsPage extends BasePage {
  private readonly roomTitle: Locator;
  private readonly roomPrice: Locator;

  constructor(page: Page) {
    super(page);
    this.roomTitle = this.robustLocator(
      page.getByRole('heading', { level: 1 }),
      page.locator('h1.fw-bold'),
    );
    this.roomPrice = page.locator('span.fs-2.fw-bold.text-primary');
  }

  getSectionHeading(section: string): Locator {
    return this.page.getByRole('heading', { name: section });
  }

  get roomTitleLocator(): Locator {
    return this.roomTitle;
  }

  get roomPriceLocator(): Locator {
    return this.roomPrice;
  }
}
