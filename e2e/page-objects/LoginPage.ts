import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { login } from '../selectors';

/**
 * Login page object
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, '/login');
  }

  /**
   * Verify that the login form is displayed
   */
  async verifyLoginForm() {
    await expect(this.page.locator(login.title)).toBeVisible();
    await expect(this.page.locator(login.form.container)).toBeVisible();
    await expect(this.page.locator(login.form.emailInput)).toBeVisible();
    await expect(this.page.locator(login.form.passwordInput)).toBeVisible();
    await expect(this.page.locator(login.form.submitButton)).toBeVisible();
  }

  /**
   * Verify that the social login section is displayed
   */
  async verifySocialLoginSection() {
    await expect(this.page.locator(login.socialLogin.container)).toBeVisible();
    await expect(this.page.locator(login.socialLogin.googleButton)).toBeVisible();
    await expect(this.page.locator(login.socialLogin.githubButton)).toBeVisible();
  }

  /**
   * Fill in the login form
   */
  async fillLoginForm(email: string, password: string) {
    await this.page.fill(login.form.emailInput, email);
    await this.page.fill(login.form.passwordInput, password);
  }

  /**
   * Submit the login form
   */
  async submitLoginForm() {
    await this.page.click(login.form.submitButton);
  }

  /**
   * Login with the given credentials
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submitLoginForm();
  }

  /**
   * Click the sign-up link
   */
  async clickSignUpLink() {
    await this.page.click(login.signUpLink);
  }

  /**
   * Click the forgot password link
   */
  async clickForgotPasswordLink() {
    await this.page.click(login.form.forgotPasswordLink);
  }
}
