import { test, expect } from '@playwright/test';
import { HomePage, LoginPage, SignUpPage, DashboardPage } from './page-objects';

/**
 * Navigation tests
 */
test.describe('Navigation', () => {
  test('should navigate between all pages', async ({ page }) => {
    // Create page objects
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const signUpPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Start at the home page
    await homePage.goto();
    await homePage.verifyUrl();
    await homePage.takeScreenshot('navigation-home');
    
    // Navigate to login page
    await homePage.navigateToLogin();
    await loginPage.verifyUrl();
    await loginPage.takeScreenshot('navigation-login');
    
    // Navigate to sign-up page from login
    await loginPage.clickSignUpLink();
    await signUpPage.verifyUrl();
    await signUpPage.takeScreenshot('navigation-signup');
    
    // Navigate back to login from sign-up
    await signUpPage.clickLoginLink();
    await loginPage.verifyUrl();
    
    // Navigate to dashboard (will redirect to login since we're not authenticated)
    await page.goto('/dashboard');
    await loginPage.verifyUrl();
    
    // Navigate back to home
    await page.goto('/');
    await homePage.verifyUrl();
  });
  
  test('should have working navigation links in header', async ({ page }) => {
    // Create page objects
    const homePage = new HomePage(page);
    
    // Start at the home page
    await homePage.goto();
    
    // Verify navigation links
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a:has-text("Log In")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Sign Up")')).toBeVisible();
    
    // Take a screenshot of the navigation
    await page.screenshot({ path: 'test-results/navigation-header.png', fullPage: false });
  });
});
