/**
 * Script to update baseline HTML snapshots
 * 
 * This script copies all HTML files from the test-results directory to the test-results/baseline directory.
 */

const fs = require('fs');
const path = require('path');

// Define directories
const currentDir = path.join(process.cwd(), 'test-results');
const baselineDir = path.join(process.cwd(), 'test-results/baseline');

// Create baseline directory if it doesn't exist
if (!fs.existsSync(baselineDir)) {
  fs.mkdirSync(baselineDir, { recursive: true });
  console.log(`Created baseline directory: ${baselineDir}`);
}

// Get all HTML files in the current directory
try {
  const files = fs.readdirSync(currentDir);
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  
  console.log(`Found ${htmlFiles.length} HTML files: ${htmlFiles.join(', ')}`);
  
  // Copy each HTML file to the baseline directory
  for (const file of htmlFiles) {
    const currentPath = path.join(currentDir, file);
    const baselinePath = path.join(baselineDir, file);
    
    console.log(`Copying ${currentPath} to ${baselinePath}`);
    fs.copyFileSync(currentPath, baselinePath);
  }
  
  console.log('Baseline snapshots updated successfully');
} catch (error) {
  console.error('Error updating baseline snapshots:', error);
  process.exit(1);
}
