/**
 * Script to compare HTML snapshots with baseline
 *
 * This script compares all HTML files in the test-results directory with their baseline versions.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Define directories
const currentDir = path.join(process.cwd(), 'test-results');
const baselineDir = path.join(process.cwd(), 'test-results/baseline');
const diffDir = path.join(process.cwd(), 'test-results/diff');

// Create diff directory if it doesn't exist
if (!fs.existsSync(diffDir)) {
  fs.mkdirSync(diffDir, { recursive: true });
  console.log(`Created diff directory: ${diffDir}`);
}

// Simple function to compare HTML
function compareHtml(html1, html2) {
  // Parse the HTML
  const dom1 = new JSDOM(html1);
  const dom2 = new JSDOM(html2);

  // Get the body content
  const body1 = dom1.window.document.body.innerHTML;
  const body2 = dom2.window.document.body.innerHTML;

  // Compare the body content
  return body1 === body2;
}

// Get all HTML files in the current directory
try {
  const files = fs.readdirSync(currentDir);
  const htmlFiles = files.filter(file => file.endsWith('.html'));

  console.log(`Found ${htmlFiles.length} HTML files: ${htmlFiles.join(', ')}`);

  // Check if files actually exist
  const existingFiles = htmlFiles.filter(file => {
    const filePath = path.join(currentDir, file);
    const exists = fs.existsSync(filePath);
    if (!exists) {
      console.log(`File ${filePath} does not exist, skipping`);
    }
    return exists;
  });

  console.log(`Found ${existingFiles.length} existing HTML files: ${existingFiles.join(', ')}`);

  let changedFiles = 0;

  // Compare each HTML file with its baseline
  for (const file of existingFiles) {
    const currentPath = path.join(currentDir, file);
    const baselinePath = path.join(baselineDir, file);
    const diffPath = path.join(diffDir, file.replace('.html', '-diff.txt'));

    console.log(`Processing file: ${file}`);
    console.log(`Current path: ${currentPath}`);
    console.log(`Current exists? ${fs.existsSync(currentPath)}`);

    // Check if baseline exists
    if (!fs.existsSync(baselinePath)) {
      console.log(`Baseline doesn't exist for ${file}, creating it`);
      try {
        fs.copyFileSync(currentPath, baselinePath);
        console.log(`Successfully created baseline for ${file}`);
      } catch (error) {
        console.error(`Error creating baseline for ${file}:`, error);
      }
      continue;
    }

    // Read the files
    let currentHtml, baselineHtml;
    try {
      currentHtml = fs.readFileSync(currentPath, 'utf-8');
      baselineHtml = fs.readFileSync(baselinePath, 'utf-8');
    } catch (error) {
      console.error(`Error reading files for ${file}:`, error);
      continue;
    }

    // Compare the files
    let isEqual;
    try {
      isEqual = compareHtml(currentHtml, baselineHtml);
    } catch (error) {
      console.error(`Error comparing HTML for ${file}:`, error);
      continue;
    }

    if (isEqual) {
      console.log(`No differences found in ${file}`);
    } else {
      changedFiles++;
      console.log(`Found differences in ${file}`);

      // Write the diff to a file
      fs.writeFileSync(diffPath, `Current: ${currentPath}\nBaseline: ${baselinePath}\n\nDifferences found!`);
    }
  }

  console.log(`Comparison complete. ${changedFiles} files have changed.`);
} catch (error) {
  console.error('Error comparing snapshots:', error);
  process.exit(1);
}
