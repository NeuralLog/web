import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects';

/**
 * Dashboard page tests
 */
test.describe('Dashboard Page', () => {
  test('should not have infinite loading spinner', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Navigate to the dashboard page
    await dashboardPage.goto();

    // Wait for the page to load
    await page.waitForTimeout(1000);

    // Check if there's an infinite loading spinner
    const hasInfiniteSpinner = await dashboardPage.hasInfiniteLoadingSpinner(3000);

    // Take a screenshot to document the state
    await dashboardPage.takeScreenshot('loading-spinner-check');

    // The spinner should not be visible after the timeout
    expect(hasInfiniteSpinner).toBe(false);
  });

  test('should display logs when available', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Navigate to the dashboard page
    await dashboardPage.goto();

    // Wait for the page to load
    await page.waitForTimeout(2000);

    // Check if logs are displayed
    const logsState = await dashboardPage.getLogsState();
    console.log('Logs state:', logsState);

    // Take a screenshot to document the state
    await dashboardPage.takeScreenshot('logs-state-check');

    // Log the HTML content for debugging
    const html = await page.content();
    console.log('Page HTML:', html.substring(0, 500) + '...');

    // Check API response
    await dashboardPage.checkApiResponse();
  });
  test('should display dashboard correctly', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Navigate to the dashboard page
    await dashboardPage.goto();

    // Verify the URL
    await dashboardPage.verifyUrl();

    // Take a screenshot
    await dashboardPage.takeScreenshot('dashboard-page');

    // Verify the header
    await dashboardPage.verifyHeader();

    // Verify the stats section
    await dashboardPage.verifyStatsSection();

    // Verify the recent logs section
    await dashboardPage.verifyRecentLogsSection();
  });

  test('should allow clicking on view all logs button', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Navigate to the dashboard page
    await dashboardPage.goto();

    // Click the view all logs button
    await dashboardPage.clickViewAllLogs();

    // Take a screenshot
    await dashboardPage.takeScreenshot('after-view-all-logs');
  });

  test('should allow clicking on view details for a log', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Navigate to the dashboard page
    await dashboardPage.goto();

    // Click the view details button for the first log
    await dashboardPage.clickViewDetailsForLog(0);

    // Take a screenshot
    await dashboardPage.takeScreenshot('after-view-details');
  });
});
