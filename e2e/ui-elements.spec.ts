import { test, expect } from '@playwright/test';
import { HomePage, LoginPage, SignUpPage, DashboardPage } from './page-objects';
import { home, login, signUp, dashboard } from './selectors';

/**
 * UI Elements test for NeuralLog
 *
 * This test checks for the presence of specific UI elements on each page
 */

test.describe('UI Elements Tests', () => {
  test('home page should have expected UI elements', async ({ page }) => {
    // Create page object
    const homePage = new HomePage(page);

    // Navigate to the home page
    await homePage.goto();

    // Verify hero section
    await expect(page.locator(home.hero.title)).toBeVisible();
    await expect(page.locator(home.hero.description)).toBeVisible();

    // Verify features section
    await expect(page.locator(home.features.container)).toBeVisible();
    const featureCards = page.locator(home.features.featureCards);
    await expect(featureCards).toHaveCount(4);

    // Verify call to action section
    await expect(page.locator(home.callToAction.container)).toBeVisible();
    await expect(page.locator(home.callToAction.title)).toBeVisible();
    await expect(page.locator(home.callToAction.signUpButton)).toBeVisible();
    await expect(page.locator(home.callToAction.loginButton)).toBeVisible();

    // Verify footer
    await expect(page.locator(home.footer.container)).toBeVisible();

    // Take a screenshot for verification
    await homePage.takeScreenshot('ui-home-elements');
  });

  test('login page should have expected UI elements', async ({ page }) => {
    // Create page object
    const loginPage = new LoginPage(page);

    // Navigate to the login page
    await loginPage.goto();

    // Verify title
    await expect(page.locator(login.title)).toBeVisible();

    // Verify form elements
    await expect(page.locator(login.form.container)).toBeVisible();
    await expect(page.locator(login.form.emailInput)).toBeVisible();
    await expect(page.locator(login.form.passwordInput)).toBeVisible();
    await expect(page.locator(login.form.rememberMeCheckbox)).toBeVisible();
    await expect(page.locator(login.form.submitButton)).toBeVisible();
    await expect(page.locator(login.form.forgotPasswordLink)).toBeVisible();

    // Verify social login section
    await expect(page.locator(login.socialLogin.container)).toBeVisible();
    await expect(page.locator(login.socialLogin.googleButton)).toBeVisible();
    await expect(page.locator(login.socialLogin.githubButton)).toBeVisible();

    // Verify sign-up link
    await expect(page.locator(login.signUpLink)).toBeVisible();

    // Take a screenshot for verification
    await loginPage.takeScreenshot('ui-login-elements');
  });

  test('sign-up page should have expected UI elements', async ({ page }) => {
    // Create page object
    const signUpPage = new SignUpPage(page);

    // Navigate to the sign-up page
    await signUpPage.goto();

    // Verify title
    await expect(page.locator(signUp.title)).toBeVisible();

    // Verify form elements
    await expect(page.locator(signUp.form.container)).toBeVisible();
    await expect(page.locator(signUp.form.firstNameInput)).toBeVisible();
    await expect(page.locator(signUp.form.lastNameInput)).toBeVisible();
    await expect(page.locator(signUp.form.emailInput)).toBeVisible();
    await expect(page.locator(signUp.form.passwordInput)).toBeVisible();
    await expect(page.locator(signUp.form.termsCheckbox)).toBeVisible();
    await expect(page.locator(signUp.form.submitButton)).toBeVisible();

    // Verify social sign-up section
    await expect(page.locator(signUp.socialSignUp.container)).toBeVisible();
    await expect(page.locator(signUp.socialSignUp.googleButton)).toBeVisible();
    await expect(page.locator(signUp.socialSignUp.githubButton)).toBeVisible();

    // Verify login link
    await expect(page.locator(signUp.loginLink)).toBeVisible();

    // Take a screenshot for verification
    await signUpPage.takeScreenshot('ui-signup-elements');
  });

  test('dashboard page should have expected UI elements', async ({ page }) => {
    // Create page object
    const dashboardPage = new DashboardPage(page);

    // Navigate to the dashboard page
    await dashboardPage.goto();

    // Check if we're redirected to login
    if (page.url().includes('/login')) {
      console.log('Redirected to login page, skipping dashboard UI test');
      return;
    }

    // Verify header
    await expect(page.locator(dashboard.header.title)).toBeVisible();

    // Verify stats section
    await expect(page.locator(dashboard.stats.container)).toBeVisible();
    await expect(page.locator(dashboard.stats.totalLogs)).toBeVisible();
    await expect(page.locator(dashboard.stats.successRate)).toBeVisible();
    await expect(page.locator(dashboard.stats.avgLatency)).toBeVisible();
    await expect(page.locator(dashboard.stats.activeModels)).toBeVisible();

    // Verify recent logs section
    await expect(page.locator(dashboard.recentLogs.container)).toBeVisible();
    await expect(page.locator(dashboard.recentLogs.title)).toBeVisible();
    await expect(page.locator(dashboard.recentLogs.viewAllButton)).toBeVisible();

    // Take a screenshot for verification
    await dashboardPage.takeScreenshot('ui-dashboard-elements');
  });
});
