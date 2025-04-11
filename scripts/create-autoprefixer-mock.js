/**
 * Create a mock autoprefixer module directly in node_modules
 */

const fs = require('fs');
const path = require('path');

console.log('Creating mock autoprefixer module...');

// Create the directory structure
const autoprefixerDir = path.join(process.cwd(), 'node_modules/autoprefixer');
if (!fs.existsSync(autoprefixerDir)) {
  fs.mkdirSync(autoprefixerDir, { recursive: true });
  console.log(`Created directory: ${autoprefixerDir}`);
}

// Create the package.json
const packageJson = {
  name: 'autoprefixer',
  version: '10.4.14',
  description: 'Mock autoprefixer for Next.js',
  main: 'index.js',
  postcss: true
};

fs.writeFileSync(
  path.join(autoprefixerDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);
console.log(`Created package.json in ${autoprefixerDir}`);

// Create the index.js
const indexJs = `// Mock implementation of autoprefixer
module.exports = () => {
  return {
    postcssPlugin: 'autoprefixer',
    Once(root) {
      // Do nothing
    }
  };
};
module.exports.postcss = true;
`;

fs.writeFileSync(
  path.join(autoprefixerDir, 'index.js'),
  indexJs
);
console.log(`Created index.js in ${autoprefixerDir}`);

// Create the bin directory and autoprefixer executable
const binDir = path.join(autoprefixerDir, 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
  console.log(`Created directory: ${binDir}`);
}

const binFile = `#!/usr/bin/env node
console.log('Mock autoprefixer');
`;

fs.writeFileSync(
  path.join(binDir, 'autoprefixer'),
  binFile
);
fs.chmodSync(path.join(binDir, 'autoprefixer'), 0o755);
console.log(`Created executable in ${binDir}`);

// Create symlink in .bin directory
const binDirLink = path.join(process.cwd(), 'node_modules/.bin');
if (!fs.existsSync(binDirLink)) {
  fs.mkdirSync(binDirLink, { recursive: true });
  console.log(`Created directory: ${binDirLink}`);
}

try {
  const target = path.relative(binDirLink, path.join(binDir, 'autoprefixer'));
  const linkPath = path.join(binDirLink, 'autoprefixer');
  
  // Remove existing link if it exists
  if (fs.existsSync(linkPath)) {
    fs.unlinkSync(linkPath);
    console.log(`Removed existing link: ${linkPath}`);
  }
  
  // Create symlink
  fs.symlinkSync(target, linkPath, 'file');
  console.log(`Created symlink: ${linkPath} -> ${target}`);
} catch (error) {
  console.error(`Error creating symlink: ${error.message}`);
}

console.log('Mock autoprefixer module created successfully!');
console.log('Please restart the Next.js server.');
