import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { LoginPage } from '../../../pages/admin/LoginPage';
import { DashboardPage } from '../../../pages/admin/DashboardPage';
import testData from '../../../fixtures/testData.json';

const { Given, When, Then } = createBdd();

Given('I am on the login page', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
});

When('I log in with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const { username, password } = testData.users.validUser;
  await loginPage.login(username, password);
});

When('I log in with invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const { username, password } = testData.users.invalidUser;
  await loginPage.login(username, password);
});

Then('I should be redirected to the dashboard', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  expect(await dashboardPage.isLoaded()).toBeTruthy();
});

Then('I should see an error message {string}', async ({ page }, expectedMessage: string) => {
  const loginPage = new LoginPage(page);
  await expect(loginPage.errorMessageLocator).toHaveText(expectedMessage);
});
