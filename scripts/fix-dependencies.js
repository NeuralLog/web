/**
 * Script to fix dependency issues in the Docker container
 * 
 * This script installs the necessary dependencies for Next.js to work properly.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting dependency fix script...');

// Check if running in Docker
const isDocker = fs.existsSync('/.dockerenv') || fs.existsSync('/proc/1/cgroup') && fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker');
console.log(`Running in Docker: ${isDocker}`);

if (!isDocker) {
  console.log('This script is intended to be run inside a Docker container.');
  process.exit(0);
}

// Install dependencies
console.log('Installing dependencies...');
try {
  // Update npm
  console.log('Updating npm...');
  execSync('npm install -g npm@latest', { stdio: 'inherit' });
  
  // Install CSS-related dependencies
  console.log('Installing CSS-related dependencies...');
  execSync('npm install --save-dev autoprefixer postcss tailwindcss', { stdio: 'inherit' });
  
  // Verify postcss.config.js exists
  const postcssConfigPath = path.join(process.cwd(), 'postcss.config.js');
  if (!fs.existsSync(postcssConfigPath)) {
    console.log('Creating postcss.config.js...');
    fs.writeFileSync(
      postcssConfigPath,
      `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
    );
  } else {
    console.log('postcss.config.js already exists.');
  }
  
  // Verify tailwind.config.js exists
  const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
  if (!fs.existsSync(tailwindConfigPath)) {
    console.log('Creating tailwind.config.js...');
    execSync('npx tailwindcss init', { stdio: 'inherit' });
  } else {
    console.log('tailwind.config.js already exists.');
  }
  
  console.log('Dependencies fixed successfully!');
} catch (error) {
  console.error('Error fixing dependencies:', error);
  process.exit(1);
}
