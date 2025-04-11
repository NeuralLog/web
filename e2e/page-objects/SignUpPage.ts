import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { signUp } from '../selectors';

/**
 * Sign-up page object
 */
export class SignUpPage extends BasePage {
  constructor(page: Page) {
    super(page, '/sign-up');
  }

  /**
   * Verify that the sign-up form is displayed
   */
  async verifySignUpForm() {
    await expect(this.page.locator(signUp.title)).toBeVisible();
    await expect(this.page.locator(signUp.form.container)).toBeVisible();
    await expect(this.page.locator(signUp.form.firstNameInput)).toBeVisible();
    await expect(this.page.locator(signUp.form.lastNameInput)).toBeVisible();
    await expect(this.page.locator(signUp.form.emailInput)).toBeVisible();
    await expect(this.page.locator(signUp.form.passwordInput)).toBeVisible();
    await expect(this.page.locator(signUp.form.termsCheckbox)).toBeVisible();
    await expect(this.page.locator(signUp.form.submitButton)).toBeVisible();
  }

  /**
   * Verify that the social sign-up section is displayed
   */
  async verifySocialSignUpSection() {
    await expect(this.page.locator(signUp.socialSignUp.container)).toBeVisible();
    await expect(this.page.locator(signUp.socialSignUp.googleButton)).toBeVisible();
    await expect(this.page.locator(signUp.socialSignUp.githubButton)).toBeVisible();
  }

  /**
   * Fill in the sign-up form
   */
  async fillSignUpForm(firstName: string, lastName: string, email: string, password: string) {
    await this.page.fill(signUp.form.firstNameInput, firstName);
    await this.page.fill(signUp.form.lastNameInput, lastName);
    await this.page.fill(signUp.form.emailInput, email);
    await this.page.fill(signUp.form.passwordInput, password);
    await this.page.check(signUp.form.termsCheckbox);
  }

  /**
   * Submit the sign-up form
   */
  async submitSignUpForm() {
    await this.page.click(signUp.form.submitButton);
  }

  /**
   * Sign up with the given information
   */
  async signUp(firstName: string, lastName: string, email: string, password: string) {
    await this.fillSignUpForm(firstName, lastName, email, password);
    await this.submitSignUpForm();
  }

  /**
   * Click the login link
   */
  async clickLoginLink() {
    await this.page.click(signUp.loginLink);
  }
}
