import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ContactPage extends BasePage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly phoneInput: Locator;
  private readonly subjectInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorAlert: Locator;
  private readonly successHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = this.robustLocator(
      page.getByLabel('Name'),
      page.getByTestId('ContactName'),
      page.locator('#name'),
    );
    this.emailInput = this.robustLocator(
      page.getByLabel('Email'),
      page.getByTestId('ContactEmail'),
      page.locator('#email'),
    );
    this.phoneInput = this.robustLocator(
      page.getByLabel('Phone'),
      page.getByTestId('ContactPhone'),
      page.locator('#phone'),
    );
    this.subjectInput = this.robustLocator(
      page.getByLabel('Subject'),
      page.getByTestId('ContactSubject'),
      page.locator('#subject'),
    );
    this.descriptionInput = this.robustLocator(
      page.getByTestId('ContactDescription'),
      page.locator('#description'),
    );
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.errorAlert = page.locator('.alert.alert-danger');
    this.successHeading = page.locator('h3.h4', { hasText: 'Thanks for getting in touch' });
  }

  async fillField(field: string, value: string): Promise<void> {
    const map: Record<string, Locator> = {
      Name: this.nameInput,
      Email: this.emailInput,
      Phone: this.phoneInput,
      Subject: this.subjectInput,
      Message: this.descriptionInput,
    };
    const locator = map[field];
    if (!locator) throw new Error(`Unknown contact field: ${field}`);
    await this.fill(locator, value);
  }

  async fillForm(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    description: string;
  }): Promise<void> {
    await this.fill(this.nameInput, data.name);
    await this.fill(this.emailInput, data.email);
    await this.fill(this.phoneInput, data.phone);
    await this.fill(this.subjectInput, data.subject);
    await this.fill(this.descriptionInput, data.description);
  }

  async submit(): Promise<void> {
    await this.click(this.submitButton);
  }

  get errorAlertLocator(): Locator {
    return this.errorAlert;
  }

  get successHeadingLocator(): Locator {
    return this.successHeading;
  }
}
