import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/testSetup';
import { HomePage } from '../../pages/HomePage';

Given('I am on the home page', async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);
  await homePage.open();
});

Then('I should see a welcome message', async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);
  const welcomeText = await homePage.getWelcomeHeadingText();
  expect(welcomeText.length).toBeGreaterThan(0);
});

Then('I should see a button Book Now', async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);
  expect(await homePage.isBookNowButtonVisible()).toBeTruthy();
  expect(await homePage.isBookNowButtonEnabled()).toBeTruthy();
});
