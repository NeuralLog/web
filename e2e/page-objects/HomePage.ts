import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { home } from '../selectors';

/**
 * Home page object
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page, '/');
  }

  /**
   * Verify that the hero section is displayed
   */
  async verifyHeroSection() {
    await expect(this.page.locator(home.hero.title)).toBeVisible();
    await expect(this.page.locator(home.hero.description)).toBeVisible();
  }

  /**
   * Verify that the features section is displayed
   */
  async verifyFeaturesSection() {
    await expect(this.page.locator(home.features.container)).toBeVisible();
    
    // Verify that we have at least 2 feature cards
    const featureCards = this.page.locator(home.features.featureCards);
    await expect(featureCards).toHaveCount(4);
    
    // Verify that each feature card has a title
    const featureTitles = this.page.locator(home.features.featureTitles);
    await expect(featureTitles).toHaveCount(4);
  }

  /**
   * Verify that the call to action section is displayed
   */
  async verifyCallToActionSection() {
    await expect(this.page.locator(home.callToAction.container)).toBeVisible();
    await expect(this.page.locator(home.callToAction.title)).toBeVisible();
    await expect(this.page.locator(home.callToAction.signUpButton)).toBeVisible();
    await expect(this.page.locator(home.callToAction.loginButton)).toBeVisible();
  }

  /**
   * Verify that the footer is displayed
   */
  async verifyFooter() {
    await expect(this.page.locator(home.footer.container)).toBeVisible();
    await expect(this.page.locator(home.footer.copyright)).toBeVisible();
  }

  /**
   * Click the sign-up button in the call to action section
   */
  async clickSignUpButton() {
    await this.page.click(home.callToAction.signUpButton);
  }

  /**
   * Click the login button in the call to action section
   */
  async clickLoginButton() {
    await this.page.click(home.callToAction.loginButton);
  }
}
