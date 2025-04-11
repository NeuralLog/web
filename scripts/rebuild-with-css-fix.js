/**
 * Script to rebuild the Docker container with CSS dependency fixes
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Starting container rebuild with CSS fixes...');

try {
  // Get the current directory
  const currentDir = process.cwd();
  console.log(`Current directory: ${currentDir}`);
  
  // Stop existing containers
  console.log('Stopping existing containers...');
  execSync('docker-compose -f docker-compose.logs.yml down', { stdio: 'inherit' });
  
  // Remove existing images to force rebuild
  console.log('Removing existing images...');
  try {
    execSync('docker rmi neurallog-web-web', { stdio: 'inherit' });
  } catch (error) {
    console.log('No existing image to remove or image is in use.');
  }
  
  // Build and start containers with the new Dockerfile
  console.log('Building and starting containers with CSS fixes...');
  execSync('docker-compose -f docker-compose.logs.yml up -d --build', { stdio: 'inherit' });
  
  console.log('Container rebuild completed successfully!');
  console.log('');
  console.log('If you still encounter CSS dependency issues, you can run:');
  console.log('docker-compose -f docker-compose.logs.yml exec web sh /app/scripts/fix-css-deps.sh');
} catch (error) {
  console.error('Error rebuilding container:', error);
  process.exit(1);
}
