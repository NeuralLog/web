import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { dashboard } from '../selectors';

/**
 * Dashboard page object
 */
export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page, '/dashboard');
  }

  /**
   * Verify that the dashboard header is displayed
   */
  async verifyHeader() {
    await expect(this.page.locator(dashboard.header.title)).toBeVisible();
  }

  /**
   * Verify that the stats section is displayed
   */
  async verifyStatsSection() {
    await expect(this.page.locator(dashboard.stats.container)).toBeVisible();

    // Verify that we have 4 stat cards
    const statCards = this.page.locator(dashboard.stats.cards);
    await expect(statCards).toHaveCount(4);

    // Verify that each stat is displayed
    await expect(this.page.locator(dashboard.stats.totalLogs)).toBeVisible();
    await expect(this.page.locator(dashboard.stats.successRate)).toBeVisible();
    await expect(this.page.locator(dashboard.stats.avgLatency)).toBeVisible();
    await expect(this.page.locator(dashboard.stats.activeModels)).toBeVisible();
  }

  /**
   * Verify that the recent logs section is displayed
   */
  async verifyRecentLogsSection() {
    await expect(this.page.locator(dashboard.recentLogs.container)).toBeVisible();
    await expect(this.page.locator(dashboard.recentLogs.title)).toBeVisible();
    await expect(this.page.locator(dashboard.recentLogs.viewAllButton)).toBeVisible();

    // Wait for loading to complete (max 5 seconds)
    await this.waitForLoadingToComplete(5000);

    // Check if we have logs or an empty state
    const logItems = this.page.locator(dashboard.recentLogs.logItems);
    const emptyState = this.page.locator(dashboard.recentLogs.emptyState);

    // Either we should have log items or an empty state message
    const hasLogs = await logItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible();

    // One of these conditions must be true
    expect(hasLogs || hasEmptyState).toBeTruthy();
  }

  /**
   * Wait for the loading spinner to disappear
   * @param timeout Maximum time to wait in milliseconds
   */
  async waitForLoadingToComplete(timeout = 5000) {
    const spinner = this.page.locator(dashboard.recentLogs.loadingSpinner);

    // If spinner is visible, wait for it to disappear
    if (await spinner.isVisible()) {
      await expect(spinner).not.toBeVisible({ timeout });
    }
  }

  /**
   * Check if the dashboard has an infinite loading spinner
   * @returns true if the loading spinner is still visible after the timeout
   */
  async hasInfiniteLoadingSpinner(timeout = 5000) {
    const spinner = this.page.locator(dashboard.recentLogs.loadingSpinner);

    // Wait for the specified timeout
    await this.page.waitForTimeout(timeout);

    // Check if the spinner is still visible
    return await spinner.isVisible();
  }

  /**
   * Get the current state of logs display
   * @returns Object with information about the logs state
   */
  async getLogsState() {
    // Check for different states
    const spinner = this.page.locator(dashboard.recentLogs.loadingSpinner);
    const emptyState = this.page.locator(dashboard.recentLogs.emptyState);
    const errorState = this.page.locator(dashboard.recentLogs.errorState);
    const logItems = this.page.locator(dashboard.recentLogs.logItems);

    // Wait for any potential loading to complete
    await this.page.waitForTimeout(2000);

    // Get the state
    const isLoading = await spinner.isVisible();
    const isEmpty = await emptyState.isVisible();
    const hasError = await errorState.isVisible();
    const logCount = await logItems.count();

    // Get the text content of the container for debugging
    const containerText = await this.page.locator(dashboard.recentLogs.container).textContent();

    return {
      isLoading,
      isEmpty,
      hasError,
      logCount,
      containerText
    };
  }

  /**
   * Check the API response directly
   */
  async checkApiResponse() {
    // Use the page's context to make a fetch request
    const apiResponse = await this.page.evaluate(async () => {
      try {
        const response = await fetch('/api/logs');
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    });

    console.log('API Response:', apiResponse);

    // Also check the specific log
    if (apiResponse.success && apiResponse.data.logs && apiResponse.data.logs.length > 0) {
      const logName = apiResponse.data.logs[0];
      const logResponse = await this.page.evaluate(async (name) => {
        try {
          const response = await fetch(`/api/logs/${name}`);
          const data = await response.json();
          return { success: true, data };
        } catch (error) {
          return { success: false, error: String(error) };
        }
      }, logName);

      console.log(`Log ${logName} Response:`, logResponse);
    }
  }

  /**
   * Click the "View All" button in the recent logs section
   */
  async clickViewAllLogs() {
    await this.page.click(dashboard.recentLogs.viewAllButton);
  }

  /**
   * Click the "View Details" button for a specific log
   */
  async clickViewDetailsForLog(index: number) {
    const viewDetailsButtons = this.page.locator(dashboard.recentLogs.viewDetailsButtons);
    await viewDetailsButtons.nth(index).click();
  }
}
