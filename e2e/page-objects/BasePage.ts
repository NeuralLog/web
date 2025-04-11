import { Page, expect } from '@playwright/test';
import { common } from '../selectors';
import { takeSnapshot, takeElementSnapshot } from '../helpers/snapshot';

/**
 * Base page object that all other page objects inherit from
 */
export class BasePage {
  readonly page: Page;
  readonly path: string;

  constructor(page: Page, path: string = '/') {
    this.page = page;
    this.path = path;
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.path);
  }

  /**
   * Verify that we're on the correct page by checking the URL
   */
  async verifyUrl() {
    await expect(this.page).toHaveURL(new RegExp(this.path));
  }

  /**
   * Take a screenshot and HTML snapshot of the page
   */
  async takeScreenshot(name: string, options: { fullPage?: boolean; selector?: string } = {}) {
    const { fullPage = true, selector } = options;
    return await takeSnapshot(this.page, name, { fullPage, selector });
  }

  /**
   * Take a screenshot and HTML snapshot of a specific element
   */
  async takeElementScreenshot(selector: string, name: string) {
    return await takeElementSnapshot(this.page, selector, name);
  }

  /**
   * Navigate to the home page
   */
  async navigateToHome() {
    await this.page.click(common.navigation.homeLink);
  }

  /**
   * Navigate to the login page
   */
  async navigateToLogin() {
    await this.page.click(common.navigation.loginLink);
  }

  /**
   * Navigate to the sign-up page
   */
  async navigateToSignUp() {
    await this.page.click(common.navigation.signUpLink);
  }

  /**
   * Navigate to the dashboard page
   */
  async navigateToDashboard() {
    await this.page.click(common.navigation.dashboardLink);
  }
}
