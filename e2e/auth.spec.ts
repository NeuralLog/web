import { test, expect } from '@playwright/test';
import { HomePage, LoginPage, SignUpPage, DashboardPage } from './page-objects';
import { generateRandomEmail, generateRandomName, generateRandomPassword } from './helpers/test-data';

/**
 * End-to-end test for authentication flow in NeuralLog
 *
 * This test covers:
 * 1. User login
 * 2. Access to protected routes
 */

// Mock Auth0 authentication for testing
test.beforeEach(async ({ page }) => {
  // Mock the Auth0 authentication by setting up localStorage
  await page.addInitScript(() => {
    // Create a mock JWT token (this is just for testing)
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    // Function to mock authenticated state
    window.mockAuthenticated = () => {
      localStorage.setItem('auth_token', mockToken);
    };

    // Function to mock unauthenticated state
    window.mockUnauthenticated = () => {
      localStorage.removeItem('auth_token');
    };
  });
});

test.describe('Authentication Flow', () => {
  // Generate random test data
  const { firstName, lastName } = generateRandomName();
  const testEmail = generateRandomEmail();
  const testPassword = generateRandomPassword();
  const testName = `${firstName} ${lastName}`;

  test('should navigate to the sign-up page from home', async ({ page }) => {
    // Create page objects
    const homePage = new HomePage(page);
    const signUpPage = new SignUpPage(page);

    // Navigate to the home page
    await homePage.goto();

    // Navigate to sign-up page
    await homePage.navigateToSignUp();

    // Verify we're on the sign-up page
    await signUpPage.verifyUrl();

    // Take a screenshot
    await signUpPage.takeScreenshot('sign-up-from-home');
  });

  test('should display login page correctly', async ({ page }) => {
    // Create page object
    const loginPage = new LoginPage(page);

    // Navigate to the login page
    await loginPage.goto();

    // Verify the login form is displayed
    await loginPage.verifyLoginForm();

    // Verify social login section is displayed
    await loginPage.verifySocialLoginSection();

    // Take a screenshot
    await loginPage.takeScreenshot('login-page');
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // Ensure we're not authenticated
    await page.evaluate(() => (window as any).mockUnauthenticated());

    // Create page objects
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    // Try to access dashboard directly
    await dashboardPage.goto();

    // We should be redirected to login
    await loginPage.verifyUrl();

    // Take a screenshot
    await loginPage.takeScreenshot('redirect-to-login');
  });

  test('should allow access to protected routes when authenticated', async ({ page }) => {
    // Mock authenticated state
    await page.evaluate(() => (window as any).mockAuthenticated());

    // Create page objects
    const dashboardPage = new DashboardPage(page);

    // Try to access dashboard directly
    await dashboardPage.goto();

    // We should stay on dashboard
    await dashboardPage.verifyUrl();

    // Take a screenshot
    await dashboardPage.takeScreenshot('authenticated-dashboard-access');
  });

  test('should allow user to sign up', async ({ page }) => {
    // Create page object
    const signUpPage = new SignUpPage(page);
    const dashboardPage = new DashboardPage(page);

    // Navigate to sign-up page
    await signUpPage.goto();

    // Fill and submit the form
    await signUpPage.signUp(firstName, lastName, testEmail, testPassword);

    // We should be redirected to dashboard
    await dashboardPage.verifyUrl();

    // Take a screenshot
    await dashboardPage.takeScreenshot('after-signup');
  });

  test('should allow user to log in', async ({ page }) => {
    // Ensure we're not authenticated
    await page.evaluate(() => (window as any).mockUnauthenticated());

    // Create page objects
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Intercept the login API call and mock a successful response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          token: 'mock-token',
          expiresIn: 3600,
          user: {
            sub: '123456789',
            name: 'Test User',
            email: testEmail
          }
        })
      });
    });

    // Navigate to login page
    await loginPage.goto();

    // Log in
    await loginPage.login(testEmail, testPassword);

    // We should be redirected to dashboard
    await dashboardPage.verifyUrl();

    // Take a screenshot
    await dashboardPage.takeScreenshot('after-login');
  });
});
