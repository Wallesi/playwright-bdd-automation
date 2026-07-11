import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { ContactPage } from '../../../pages/landing/ContactPage';
import testData from '../../../fixtures/testData.json';

const { When, Then } = createBdd();

When('I fill in the contact form with valid data', async ({ page }) => {
  const contactPage = new ContactPage(page);
  await contactPage.fillForm(testData.contact.validForm);
});

When('I fill in the {string} contact field with {string}', async ({ page }, field: string, value: string) => {
  const contactPage = new ContactPage(page);
  await contactPage.fillField(field, value);
});

When('I submit the contact form', async ({ page }) => {
  const contactPage = new ContactPage(page);
  await contactPage.submit();
});

Then('I should see the contact success message', async ({ page }) => {
  const contactPage = new ContactPage(page);
  await expect(contactPage.successHeadingLocator).toContainText('Thanks for getting in touch');
});

Then('I should see the contact error {string}', async ({ page }, error: string) => {
  const contactPage = new ContactPage(page);
  await expect(contactPage.errorAlertLocator).toContainText(error);
});
