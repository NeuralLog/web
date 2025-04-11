import { test } from '@playwright/test';
import { HomePage, LoginPage, SignUpPage, DashboardPage } from './page-objects';
import { home, login, signUp, dashboard } from './selectors';

/**
 * Screenshot utility
 *
 * This test is used to take screenshots and HTML snapshots of all pages for documentation purposes.
 */
test.describe('Screenshot Utility', () => {
  test('take screenshots and HTML snapshots of all pages', async ({ page }) => {
    // Create page objects
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const signUpPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);

    // Take screenshot of home page
    await homePage.goto();
    await homePage.takeScreenshot('home-page-full');
    console.log('Home page screenshot and HTML snapshot saved');

    // Take screenshot of login page
    await loginPage.goto();
    await loginPage.takeScreenshot('login-page-full');
    console.log('Login page screenshot and HTML snapshot saved');

    // Take screenshot of sign-up page
    await signUpPage.goto();
    await signUpPage.takeScreenshot('sign-up-page-full');
    console.log('Sign-up page screenshot and HTML snapshot saved');

    // Take screenshot of dashboard page
    await dashboardPage.goto();

    // Check if we're redirected to login
    if (!page.url().includes('/login')) {
      await dashboardPage.takeScreenshot('dashboard-page-full');
      console.log('Dashboard page screenshot and HTML snapshot saved');
    } else {
      console.log('Dashboard redirected to login, skipping screenshot');
    }
  });

  test('take screenshots and HTML snapshots of form interactions', async ({ page }) => {
    // Create page objects
    const loginPage = new LoginPage(page);
    const signUpPage = new SignUpPage(page);

    // Take screenshot of login form with data
    await loginPage.goto();
    await loginPage.fillLoginForm('test@example.com', 'password123');
    await loginPage.takeScreenshot('login-form-filled');
    await loginPage.takeElementScreenshot(login.form.container, 'login-form-element');
    console.log('Login form filled screenshot and HTML snapshot saved');

    // Take screenshot of sign-up form with data
    await signUpPage.goto();
    await signUpPage.fillSignUpForm('John', 'Doe', 'john.doe@example.com', 'password123');
    await signUpPage.takeScreenshot('sign-up-form-filled');
    await signUpPage.takeElementScreenshot(signUp.form.container, 'sign-up-form-element');
    console.log('Sign-up form filled screenshot and HTML snapshot saved');
  });

  test('take screenshots and HTML snapshots of specific UI components', async ({ page }) => {
    // Create page objects
    const homePage = new HomePage(page);
    const dashboardPage = new DashboardPage(page);

    // Take screenshots of home page components
    await homePage.goto();
    await homePage.takeElementScreenshot(home.hero.title, 'home-hero-title');
    await homePage.takeElementScreenshot(home.features.container, 'home-features');
    await homePage.takeElementScreenshot(home.callToAction.container, 'home-cta');
    await homePage.takeElementScreenshot(home.footer.container, 'home-footer');
    console.log('Home page component screenshots and HTML snapshots saved');

    // Take screenshots of dashboard components if accessible
    await dashboardPage.goto();
    if (!page.url().includes('/login')) {
      await dashboardPage.takeElementScreenshot(dashboard.stats.container, 'dashboard-stats');
      await dashboardPage.takeElementScreenshot(dashboard.recentLogs.container, 'dashboard-logs');
      console.log('Dashboard component screenshots and HTML snapshots saved');
    } else {
      console.log('Dashboard redirected to login, skipping component screenshots');
    }
  });
});
