import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { DashboardPage } from '../../../pages/admin/DashboardPage';

const { When, Then } = createBdd();

When('I click the {string} link in the navbar', async ({ page }, section: string) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickNavLink(section);
});

Then('the URL should contain {string}', async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(path));
});
