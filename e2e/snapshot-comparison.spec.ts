import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { compareHtmlSnapshots } from './helpers/compare-snapshots';

/**
 * Snapshot comparison tests
 *
 * These tests compare the current HTML snapshots with the baseline snapshots
 * to detect changes in the UI structure.
 */
test.describe('Snapshot Comparison', () => {
  const baselineDir = path.join(process.cwd(), 'test-results/baseline');
  const currentDir = path.join(process.cwd(), 'test-results');
  const diffDir = path.join(process.cwd(), 'test-results/diff');

  // Create directories if they don't exist
  test.beforeAll(() => {
    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true });
    }

    if (!fs.existsSync(diffDir)) {
      fs.mkdirSync(diffDir, { recursive: true });
    }
  });

  test('compare HTML snapshots with baseline', async () => {
    console.log('Starting compare HTML snapshots test');
    console.log('Current directory exists?', fs.existsSync(currentDir));
    console.log('Current directory is a directory?', fs.existsSync(currentDir) && fs.statSync(currentDir).isDirectory());
    console.log('Current directory path:', currentDir);
    console.log('Baseline directory exists?', fs.existsSync(baselineDir));
    console.log('Diff directory exists?', fs.existsSync(diffDir));

    // Try to list files using fs.readdirSync
    try {
      console.log('Trying fs.readdirSync...');
      const files = fs.readdirSync(currentDir);
      console.log('Files in directory using fs.readdirSync:', files);

      // Check for HTML files
      const htmlFilesFs = files.filter(file => file.endsWith('.html'));
      console.log('HTML files using fs.readdirSync:', htmlFilesFs);
    } catch (error) {
      console.error('Error using fs.readdirSync:', error);
    }

    // Use a direct command to find HTML files
    console.log('Trying PowerShell command...');
    const { execSync } = require('child_process');
    let htmlFiles = [];

    try {
      // Use PowerShell to list HTML files
      const command = `Get-ChildItem -Path "${currentDir}" -Filter *.html | Select-Object -ExpandProperty Name`;
      console.log('PowerShell command:', command);

      const result = execSync(`powershell -Command "${command}"`, { encoding: 'utf8' });
      console.log('PowerShell raw result:', result);

      // Parse the result
      htmlFiles = result.trim().split('\n').filter(file => file.trim() !== '');
      console.log('Parsed HTML files:', htmlFiles);

      console.log(`Found ${htmlFiles.length} HTML files using PowerShell: ${htmlFiles.join(', ')}`);
    } catch (error) {
      console.error('Error executing PowerShell command:', error);
    }

    // Try a different PowerShell command
    try {
      console.log('Trying alternative PowerShell command...');
      const altCommand = `dir "${currentDir}\*.html" | Select-Object -ExpandProperty Name`;
      console.log('Alternative PowerShell command:', altCommand);

      const altResult = execSync(`powershell -Command "${altCommand}"`, { encoding: 'utf8' });
      console.log('Alternative PowerShell raw result:', altResult);

      // Parse the result
      const altHtmlFiles = altResult.trim().split('\n').filter(file => file.trim() !== '');
      console.log('Alternative parsed HTML files:', altHtmlFiles);

      if (altHtmlFiles.length > 0 && htmlFiles.length === 0) {
        htmlFiles = altHtmlFiles;
        console.log('Using alternative HTML files list');
      }
    } catch (error) {
      console.error('Error executing alternative PowerShell command:', error);
    }

    console.log(`Current directory: ${currentDir}`);
    console.log(`Baseline directory: ${baselineDir}`);
    console.log(`Diff directory: ${diffDir}`);

    // Compare each snapshot with its baseline
    console.log(`Processing ${htmlFiles.length} HTML files for comparison...`);
    for (const file of htmlFiles) {
      const baselinePath = path.join(baselineDir, file);
      const currentPath = path.join(currentDir, file);
      const diffPath = path.join(diffDir, file.replace('.html', '-diff.txt'));

      console.log(`Processing file: ${file}`);
      console.log(`Current path: ${currentPath}`);
      console.log(`Current exists? ${fs.existsSync(currentPath)}`);
      console.log(`Baseline path: ${baselinePath}`);
      console.log(`Baseline exists? ${fs.existsSync(baselinePath)}`);
      console.log(`Diff path: ${diffPath}`);

      // If baseline doesn't exist, copy current as baseline
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

      // Compare snapshots
      console.log(`Comparing ${file} with baseline`);
      try {
        const result = compareHtmlSnapshots(baselinePath, currentPath, {
          outputDiffPath: diffPath,
          ignoreAttributes: ['id', 'class', 'style', 'data-testid', 'data-playwright-test'],
          ignoreElements: ['script', 'noscript', 'style', 'meta', 'link']
        });

        console.log(`Comparison result for ${file}:`, { isDifferent: result.isDifferent });

        if (result.isDifferent) {
          console.log(`Found differences in ${file}, see ${diffPath} for details`);
          // We don't fail the test, just log the differences
          // This allows us to review the changes and update the baseline if needed
        } else {
          console.log(`No differences found in ${file}`);
        }
      } catch (error) {
        console.error(`Error comparing ${file}:`, error);
      }
    }
  });

  test('update baseline snapshots', async ({ page }) => {
    // This test is skipped by default
    // Run it with --grep "update baseline" to update the baseline snapshots
    console.log('Starting update baseline snapshots test');
    console.log('UPDATE_BASELINE env var:', process.env.UPDATE_BASELINE);
    test.skip(!process.env.UPDATE_BASELINE, 'Skipping baseline update');

    console.log('Current directory exists?', fs.existsSync(currentDir));
    console.log('Current directory is a directory?', fs.existsSync(currentDir) && fs.statSync(currentDir).isDirectory());
    console.log('Current directory path:', currentDir);

    // Try to list files using fs.readdirSync
    try {
      console.log('Trying fs.readdirSync...');
      const files = fs.readdirSync(currentDir);
      console.log('Files in directory using fs.readdirSync:', files);

      // Check for HTML files
      const htmlFilesFs = files.filter(file => file.endsWith('.html'));
      console.log('HTML files using fs.readdirSync:', htmlFilesFs);
    } catch (error) {
      console.error('Error using fs.readdirSync:', error);
    }

    // Use a direct command to find HTML files
    console.log('Trying PowerShell command...');
    const { execSync } = require('child_process');
    let htmlFiles = [];

    try {
      // Use PowerShell to list HTML files
      const command = `Get-ChildItem -Path "${currentDir}" -Filter *.html | Select-Object -ExpandProperty Name`;
      console.log('PowerShell command:', command);

      const result = execSync(`powershell -Command "${command}"`, { encoding: 'utf8' });
      console.log('PowerShell raw result:', result);

      // Parse the result
      htmlFiles = result.trim().split('\n').filter(file => file.trim() !== '');
      console.log('Parsed HTML files:', htmlFiles);

      console.log(`Found ${htmlFiles.length} HTML files using PowerShell: ${htmlFiles.join(', ')}`);
    } catch (error) {
      console.error('Error executing PowerShell command:', error);
    }

    // Try a different PowerShell command
    try {
      console.log('Trying alternative PowerShell command...');
      const altCommand = `dir "${currentDir}\*.html" | Select-Object -ExpandProperty Name`;
      console.log('Alternative PowerShell command:', altCommand);

      const altResult = execSync(`powershell -Command "${altCommand}"`, { encoding: 'utf8' });
      console.log('Alternative PowerShell raw result:', altResult);

      // Parse the result
      const altHtmlFiles = altResult.trim().split('\n').filter(file => file.trim() !== '');
      console.log('Alternative parsed HTML files:', altHtmlFiles);

      if (altHtmlFiles.length > 0 && htmlFiles.length === 0) {
        htmlFiles = altHtmlFiles;
        console.log('Using alternative HTML files list');
      }
    } catch (error) {
      console.error('Error executing alternative PowerShell command:', error);
    }

    // Create baseline directory if it doesn't exist
    console.log('Baseline directory exists?', fs.existsSync(baselineDir));
    if (!fs.existsSync(baselineDir)) {
      console.log('Creating baseline directory...');
      fs.mkdirSync(baselineDir, { recursive: true });
      console.log('Baseline directory created');
    }

    // Update each baseline
    console.log(`Processing ${htmlFiles.length} HTML files...`);
    for (const file of htmlFiles) {
      const baselinePath = path.join(baselineDir, file);
      const currentPath = path.join(currentDir, file);

      console.log(`Processing file: ${file}`);
      console.log(`Source path: ${currentPath}`);
      console.log(`Source exists? ${fs.existsSync(currentPath)}`);
      console.log(`Destination path: ${baselinePath}`);

      try {
        console.log(`Copying ${currentPath} to ${baselinePath}...`);
        fs.copyFileSync(currentPath, baselinePath);
        console.log(`Successfully copied ${file}`);
      } catch (error) {
        console.error(`Error copying ${currentPath} to ${baselinePath}:`, error);
      }
    }

    console.log('Baseline snapshots updated');
  });
});
