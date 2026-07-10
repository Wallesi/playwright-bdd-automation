import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#doLogin');
    this.errorMessage = page.locator('[role="alert"].alert-danger');
  }

  async open(): Promise<void> {
    await this.goto('/admin');
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  get errorMessageLocator(): Locator {
    return this.errorMessage;
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }
}
