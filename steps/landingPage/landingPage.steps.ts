import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { LandingPage } from '../../pages/landing/LandingPage';

const { Given, When, Then } = createBdd();

Given('I am on the landing page', async ({ page }) => {
  const landingPage = new LandingPage(page);
  await landingPage.open();
});

When('I click the {string} section link in the navbar', async ({ page }, section: string) => {
  const landingPage = new LandingPage(page);
  await landingPage.clickNavLink(section);
});

Then('I should see a section heading {string}', async ({ page }, heading: string) => {
  const landingPage = new LandingPage(page);
  await expect(landingPage.getSectionHeading(heading)).toBeVisible();
});
