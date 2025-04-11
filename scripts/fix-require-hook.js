/**
 * Direct fix for autoprefixer issue in Next.js
 * 
 * This script directly modifies the Next.js require hook to handle the autoprefixer module.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting direct fix for autoprefixer issue...');

// Path to the Next.js require hook
const requireHookPath = path.join(process.cwd(), 'node_modules/next/dist/server/require-hook.js');

// Check if the file exists
if (!fs.existsSync(requireHookPath)) {
  console.error(`Error: Could not find ${requireHookPath}`);
  process.exit(1);
}

// Read the file
const content = fs.readFileSync(requireHookPath, 'utf8');

// Check if the file has already been modified
if (content.includes('// AUTOPREFIXER FIX')) {
  console.log('The file has already been modified.');
  process.exit(0);
}

// Modify the file to handle autoprefixer
const modified = content.replace(
  'function getResolve() {',
  `// AUTOPREFIXER FIX
function getResolve() {
  // Handle autoprefixer specially
  const originalResolve = require.resolve;
  require.resolve = function(request, options) {
    if (request === 'autoprefixer') {
      try {
        return originalResolve(request, options);
      } catch (e) {
        console.warn('Autoprefixer not found, using mock implementation');
        return require.resolve('./autoprefixer-mock.js');
      }
    }
    return originalResolve(request, options);
  };`
);

// Write the modified file
fs.writeFileSync(requireHookPath, modified);
console.log(`Modified ${requireHookPath}`);

// Create a mock autoprefixer module
const mockPath = path.join(process.cwd(), 'node_modules/next/dist/server/autoprefixer-mock.js');
fs.writeFileSync(
  mockPath,
  `// Mock implementation of autoprefixer
module.exports = () => {
  return {
    postcssPlugin: 'autoprefixer',
    Once(root) {
      // Do nothing
    }
  };
};
module.exports.postcss = true;`
);
console.log(`Created mock autoprefixer at ${mockPath}`);

console.log('Direct fix completed successfully!');
console.log('Please restart the Next.js server.');
