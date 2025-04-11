import { test, expect } from '@playwright/test';

/**
 * End-to-end test for API key management in NeuralLog
 * 
 * This test covers:
 * 1. Creating API keys
 * 2. Viewing API keys
 * 3. Revoking API keys
 */

test.describe('API Key Management', () => {
  // Test user credentials
  const userEmail = 'user@example.com';
  const userPassword = 'User@123456';
  
  // Setup: login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(userEmail);
    await page.getByLabel('Password').fill(userPassword);
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Wait for dashboard redirect
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should allow user to create an API key', async ({ page }) => {
    // Navigate to API keys page
    await page.goto('/settings/api-keys');
    
    // Click on create API key button
    await page.getByRole('button', { name: /Create API Key/i }).click();
    
    // Fill in API key details
    await page.getByLabel('Key Name').fill('Test API Key');
    await page.getByLabel('Description').fill('API key for testing');
    await page.getByLabel('Expiration').selectOption('30days');
    
    // Submit the form
    await page.getByRole('button', { name: /Generate/i }).click();
    
    // Verify API key is displayed
    await expect(page.getByText(/Your API Key/i)).toBeVisible();
    
    // Save the API key for later tests
    const apiKeyElement = page.getByText(/^[A-Za-z0-9]{32,}$/);
    await expect(apiKeyElement).toBeVisible();
    
    // Copy the API key
    const apiKey = await apiKeyElement.textContent();
    console.log('Generated API Key:', apiKey);
    
    // Close the modal
    await page.getByRole('button', { name: /Close/i }).click();
    
    // Verify the new API key appears in the list
    await expect(page.getByText('Test API Key')).toBeVisible();
  });

  test('should display API key details', async ({ page }) => {
    // Navigate to API keys page
    await page.goto('/settings/api-keys');
    
    // Click on the API key to view details
    await page.getByText('Test API Key').click();
    
    // Verify API key details are displayed
    await expect(page.getByText(/API Key Details/i)).toBeVisible();
    await expect(page.getByText(/Test API Key/i)).toBeVisible();
    await expect(page.getByText(/API key for testing/i)).toBeVisible();
    await expect(page.getByText(/Expires in/i)).toBeVisible();
  });

  test('should allow user to revoke an API key', async ({ page }) => {
    // Navigate to API keys page
    await page.goto('/settings/api-keys');
    
    // Click on the API key to view details
    await page.getByText('Test API Key').click();
    
    // Click on revoke button
    await page.getByRole('button', { name: /Revoke/i }).click();
    
    // Confirm revocation
    await page.getByRole('button', { name: /Confirm/i }).click();
    
    // Verify success message
    await expect(page.getByText(/API key revoked successfully/i)).toBeVisible();
    
    // Verify the API key is marked as revoked in the list
    await expect(page.getByText(/Revoked/i)).toBeVisible();
  });
});
