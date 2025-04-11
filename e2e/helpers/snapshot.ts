import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper functions for taking snapshots (screenshots and HTML)
 */

/**
 * Take a screenshot and HTML snapshot of the current page
 *
 * @param page Playwright page object
 * @param name Name of the snapshot (without extension)
 * @param options Options for the snapshot
 */
export async function takeSnapshot(
  page: Page,
  name: string,
  options: {
    screenshotDir?: string;
    htmlDir?: string;
    fullPage?: boolean;
    selector?: string;
  } = {}
) {
  const {
    screenshotDir = path.join(process.cwd(), 'test-results'),
    htmlDir = path.join(process.cwd(), 'test-results'),
    fullPage = true,
    selector
  } = options;

  // Create directories if they don't exist
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }

  // Take screenshot
  const screenshotPath = path.join(screenshotDir, `${name}.png`);
  if (selector) {
    await page.locator(selector).screenshot({ path: screenshotPath });
  } else {
    await page.screenshot({ path: screenshotPath, fullPage });
  }

  // Take HTML snapshot
  const htmlPath = path.join(htmlDir, `${name}.html`);
  const html = await page.content();
  fs.writeFileSync(htmlPath, html);

  return { screenshotPath, htmlPath };
}

/**
 * Take a screenshot and HTML snapshot of a specific element
 *
 * @param page Playwright page object
 * @param selector CSS selector for the element
 * @param name Name of the snapshot (without extension)
 * @param options Options for the snapshot
 */
export async function takeElementSnapshot(
  page: Page,
  selector: string,
  name: string,
  options: {
    screenshotDir?: string;
    htmlDir?: string;
  } = {}
) {
  const {
    screenshotDir = path.join(process.cwd(), 'test-results'),
    htmlDir = path.join(process.cwd(), 'test-results')
  } = options;

  // Create directories if they don't exist
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }

  // Take screenshot of the element
  const screenshotPath = path.join(screenshotDir, `${name}.png`);
  await page.locator(selector).screenshot({ path: screenshotPath });

  // Take HTML snapshot of the element
  const htmlPath = path.join(htmlDir, `${name}.html`);
  const elementHTML = await page.locator(selector).evaluate(node => node.outerHTML);
  fs.writeFileSync(htmlPath, elementHTML);

  return { screenshotPath, htmlPath };
}
