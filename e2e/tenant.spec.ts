import { test, expect } from '@playwright/test';

/**
 * End-to-end test for tenant management in NeuralLog
 * 
 * This test covers:
 * 1. Viewing tenant information
 * 2. Adding users to a tenant
 * 3. Managing tenant settings
 */

test.describe('Tenant Management', () => {
  // Test user credentials
  const adminEmail = 'admin@example.com';
  const adminPassword = 'Admin@123456';
  const testTenantName = `Test Tenant ${Date.now()}`;

  // Setup: login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(adminEmail);
    await page.getByLabel('Password').fill(adminPassword);
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Wait for dashboard redirect
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display tenant information', async ({ page }) => {
    // Navigate to tenant info page
    await page.goto('/tenant');
    
    // Verify tenant information is displayed
    await expect(page.getByRole('heading', { name: /Tenant Information/i })).toBeVisible();
    await expect(page.getByText(/Tenant ID:/i)).toBeVisible();
    await expect(page.getByText(/default/i)).toBeVisible();
  });

  test('should allow admin to create a new tenant', async ({ page }) => {
    // Navigate to tenant management page
    await page.goto('/admin/tenants');
    
    // Click on create tenant button
    await page.getByRole('button', { name: /Create Tenant/i }).click();
    
    // Fill in tenant details
    await page.getByLabel('Tenant Name').fill(testTenantName);
    await page.getByLabel('Tenant Description').fill('Test tenant description');
    
    // Submit the form
    await page.getByRole('button', { name: /Create/i }).click();
    
    // Verify success message
    await expect(page.getByText(/Tenant created successfully/i)).toBeVisible();
    
    // Verify new tenant appears in the list
    await expect(page.getByText(testTenantName)).toBeVisible();
  });

  test('should allow admin to add a user to a tenant', async ({ page }) => {
    // Navigate to tenant users page
    await page.goto('/admin/tenants/users');
    
    // Click on add user button
    await page.getByRole('button', { name: /Add User/i }).click();
    
    // Fill in user details
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Role').selectOption('member');
    
    // Submit the form
    await page.getByRole('button', { name: /Add/i }).click();
    
    // Verify success message
    await expect(page.getByText(/User added successfully/i)).toBeVisible();
    
    // Verify new user appears in the list
    await expect(page.getByText('newuser@example.com')).toBeVisible();
  });

  test('should allow admin to update tenant settings', async ({ page }) => {
    // Navigate to tenant settings page
    await page.goto('/admin/tenants/settings');
    
    // Update tenant name
    const updatedName = `${testTenantName} Updated`;
    await page.getByLabel('Tenant Name').fill(updatedName);
    
    // Submit the form
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/Settings updated successfully/i)).toBeVisible();
    
    // Verify updated name is displayed
    await expect(page.getByLabel('Tenant Name')).toHaveValue(updatedName);
  });
});
