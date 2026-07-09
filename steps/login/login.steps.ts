import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/testSetup';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import testData from '../../fixtures/testData.json';

Given('I am on the login page', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.open();
});

When('I log in with valid credentials', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const { username, password } = testData.users.validUser;
  await loginPage.login(username, password);
});

When('I log in with invalid credentials', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const { username, password } = testData.users.invalidUser;
  await loginPage.login(username, password);
});

Then('I should be redirected to the dashboard', async function (this: CustomWorld) {
  const dashboardPage = new DashboardPage(this.page);
  expect(await dashboardPage.isLoaded()).toBeTruthy();
});

Then('I should see an error message {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  expect(await loginPage.getErrorMessage()).toBe(expectedMessage);
});
