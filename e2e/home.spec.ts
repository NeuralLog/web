import { test, expect } from '@playwright/test';
import { HomePage, LoginPage, SignUpPage } from './page-objects';

/**
 * Home page tests
 */
test.describe('Home Page', () => {
  test('should display all sections correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Navigate to the home page
    await homePage.goto();
    
    // Verify the URL
    await homePage.verifyUrl();
    
    // Take a screenshot
    await homePage.takeScreenshot('home-page');
    
    // Verify all sections
    await homePage.verifyHeroSection();
    await homePage.verifyFeaturesSection();
    await homePage.verifyCallToActionSection();
    await homePage.verifyFooter();
  });
  
  test('should navigate to sign-up page when clicking sign-up button', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Navigate to the home page
    await homePage.goto();
    
    // Click the sign-up button
    await homePage.clickSignUpButton();
    
    // Verify we're on the sign-up page
    const signUpPage = new SignUpPage(page);
    await signUpPage.verifyUrl();
    
    // Take a screenshot
    await signUpPage.takeScreenshot('sign-up-from-home');
  });
  
  test('should navigate to login page when clicking login button', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Navigate to the home page
    await homePage.goto();
    
    // Click the login button
    await homePage.clickLoginButton();
    
    // Verify we're on the login page
    const loginPage = new LoginPage(page);
    await loginPage.verifyUrl();
    
    // Take a screenshot
    await loginPage.takeScreenshot('login-from-home');
  });
});
