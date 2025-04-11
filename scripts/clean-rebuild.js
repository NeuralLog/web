/**
 * Script to completely rebuild the Docker container from scratch
 */

const { execSync } = require('child_process');

console.log('Starting clean rebuild of Docker containers...');

try {
  // Stop and remove containers
  console.log('Stopping and removing containers...');
  execSync('docker-compose -f docker-compose.logs.yml down', { stdio: 'inherit' });
  
  // Remove all related images
  console.log('Removing related images...');
  try {
    execSync('docker images | grep neurallog | awk \'{print $3}\' | xargs docker rmi -f', { stdio: 'inherit' });
  } catch (error) {
    console.log('No existing images to remove or command failed.');
  }
  
  // Clean Docker system
  console.log('Cleaning Docker system...');
  try {
    execSync('docker system prune -f', { stdio: 'inherit' });
  } catch (error) {
    console.log('Docker system prune failed or not needed.');
  }
  
  // Rebuild and start containers
  console.log('Rebuilding and starting containers...');
  execSync('docker-compose -f docker-compose.logs.yml up -d --build --force-recreate', { stdio: 'inherit' });
  
  console.log('Clean rebuild completed successfully!');
  console.log('');
  console.log('To view logs:');
  console.log('npm run docker:logs:logs');
} catch (error) {
  console.error('Error during clean rebuild:', error);
  process.exit(1);
}
