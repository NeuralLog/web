import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { diffLines } from 'diff';
import chalk from 'chalk';

/**
 * Compare HTML snapshots to detect changes
 * 
 * @param baselinePath Path to the baseline HTML snapshot
 * @param currentPath Path to the current HTML snapshot
 * @param options Options for comparison
 * @returns Object with comparison results
 */
export function compareHtmlSnapshots(
  baselinePath: string,
  currentPath: string,
  options: {
    ignoreAttributes?: string[];
    ignoreElements?: string[];
    outputDiffPath?: string;
  } = {}
) {
  const {
    ignoreAttributes = ['id', 'class', 'style'],
    ignoreElements = ['script', 'noscript', 'style'],
    outputDiffPath
  } = options;

  // Read the HTML files
  const baselineHtml = fs.readFileSync(baselinePath, 'utf-8');
  const currentHtml = fs.readFileSync(currentPath, 'utf-8');

  // Parse the HTML
  const baselineDom = new JSDOM(baselineHtml);
  const currentDom = new JSDOM(currentHtml);

  // Clean up the DOMs (remove ignored elements and attributes)
  cleanupDom(baselineDom.window.document, ignoreElements, ignoreAttributes);
  cleanupDom(currentDom.window.document, ignoreElements, ignoreAttributes);

  // Get the cleaned HTML
  const cleanedBaselineHtml = baselineDom.window.document.documentElement.outerHTML;
  const cleanedCurrentHtml = currentDom.window.document.documentElement.outerHTML;

  // Compare the HTML
  const isDifferent = cleanedBaselineHtml !== cleanedCurrentHtml;
  
  // Generate diff if different
  let diff = '';
  if (isDifferent) {
    diff = generateDiff(cleanedBaselineHtml, cleanedCurrentHtml);
    
    // Save diff to file if requested
    if (outputDiffPath) {
      const diffDir = path.dirname(outputDiffPath);
      if (!fs.existsSync(diffDir)) {
        fs.mkdirSync(diffDir, { recursive: true });
      }
      fs.writeFileSync(outputDiffPath, diff);
    }
  }

  return {
    isDifferent,
    diff,
    baselineHtml: cleanedBaselineHtml,
    currentHtml: cleanedCurrentHtml
  };
}

/**
 * Clean up a DOM by removing ignored elements and attributes
 * 
 * @param document DOM document to clean up
 * @param ignoreElements Elements to remove
 * @param ignoreAttributes Attributes to remove
 */
function cleanupDom(
  document: Document,
  ignoreElements: string[],
  ignoreAttributes: string[]
) {
  // Remove ignored elements
  ignoreElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => element.parentNode?.removeChild(element));
  });

  // Remove ignored attributes from all elements
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    ignoreAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
  });
}

/**
 * Generate a diff between two HTML strings
 * 
 * @param baseline Baseline HTML
 * @param current Current HTML
 * @returns Diff string
 */
function generateDiff(baseline: string, current: string): string {
  const changes = diffLines(baseline, current);
  
  let diffOutput = '';
  
  changes.forEach(change => {
    const color = change.added ? chalk.green : change.removed ? chalk.red : chalk.grey;
    const prefix = change.added ? '+' : change.removed ? '-' : ' ';
    const lines = change.value.split('\n').filter(line => line.trim() !== '');
    
    lines.forEach(line => {
      diffOutput += `${color(prefix + line)}\n`;
    });
  });
  
  return diffOutput;
}
