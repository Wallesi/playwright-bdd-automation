import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/testSetup';
import { DashboardPage } from '../../pages/DashboardPage';

Then('I should see a welcome message', async function (this: CustomWorld) {
  const dashboardPage = new DashboardPage(this.page);
  const welcomeText = await dashboardPage.getWelcomeText();
  expect(welcomeText.length).toBeGreaterThan(0);
});
