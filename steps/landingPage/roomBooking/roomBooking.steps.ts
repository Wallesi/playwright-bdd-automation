import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { LandingPage } from '../../../pages/landing/LandingPage';
import { RoomDetailsPage } from '../../../pages/landing/RoomDetailsPage';

const { When, Then } = createBdd();

When('I click the {string} "Book Now" button', async ({ page }, room: string) => {
  const landingPage = new LandingPage(page);
  await landingPage.clickBookNow(room);
});

Then('I should be redirected to the {string} room page', async ({ page }, room: string) => {
  const roomDetailsPage = new RoomDetailsPage(page);
  await expect(roomDetailsPage.roomTitleLocator).toHaveText(`${room} Room`);
});

Then('I should see the {string} section', async ({ page }, section: string) => {
  const roomDetailsPage = new RoomDetailsPage(page);
  await expect(roomDetailsPage.getSectionHeading(section)).toBeVisible();
});

Then('I should see the room price', async ({ page }) => {
  const roomDetailsPage = new RoomDetailsPage(page);
  await expect(roomDetailsPage.roomPriceLocator).toBeVisible();
});
