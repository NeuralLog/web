import { test, expect } from '@playwright/test';
import { HomePage, LoginPage, SignUpPage, DashboardPage } from './page-objects';

/**
 * Simplified end-to-end test for authentication flow in NeuralLog
 *
 * This test covers:
 * 1. Navigation to authentication pages
 * 2. Basic page structure verification
 */

test.describe('Basic Navigation Tests', () => {
  test('should navigate to the sign-up page', async ({ page }) => {
    // Create page object
    const signUpPage = new SignUpPage(page);

    // Navigate to the sign-up page
    await signUpPage.goto();

    // Verify we're on the sign-up page
    await signUpPage.verifyUrl();

    // Take a screenshot for verification
    await signUpPage.takeScreenshot('simple-sign-up-page');

    // Log the current URL for debugging
    console.log('Sign-up page URL:', page.url());
  });

  test('should navigate to the login page', async ({ page }) => {
    // Create page object
    const loginPage = new LoginPage(page);

    // Navigate to the login page
    await loginPage.goto();

    // Verify we're on the login page
    await loginPage.verifyUrl();

    // Take a screenshot for verification
    await loginPage.takeScreenshot('simple-login-page');

    // Log the current URL for debugging
    console.log('Login page URL:', page.url());
  });

  test('should navigate to the dashboard page', async ({ page }) => {
    // Create page object
    const dashboardPage = new DashboardPage(page);

    // Navigate to the dashboard page
    await dashboardPage.goto();

    // Verify we're on the dashboard page (or redirected to login)
    try {
      await dashboardPage.verifyUrl();
      await dashboardPage.takeScreenshot('simple-dashboard-page');
    } catch (e) {
      // If we're redirected to login, that's also acceptable
      const loginPage = new LoginPage(page);
      await loginPage.verifyUrl();
      await loginPage.takeScreenshot('simple-dashboard-redirected');
    }

    // Log the current URL for debugging
    console.log('Dashboard page URL:', page.url());
  });

  test('should navigate to the home page', async ({ page }) => {
    // Create page object
    const homePage = new HomePage(page);

    // Navigate to the home page
    await homePage.goto();

    // Verify we're on the home page
    await homePage.verifyUrl();

    // Take a screenshot for verification
    await homePage.takeScreenshot('simple-home-page');

    // Log the current URL for debugging
    console.log('Home page URL:', page.url());
  });
});
