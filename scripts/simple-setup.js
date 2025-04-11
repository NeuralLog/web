/**
 * Simple Development Setup Script
 * 
 * This script sets up the development environment by:
 * 1. Seeding Redis with a default tenant
 */

const Redis = require('ioredis');

// Configuration
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: process.env.REDIS_DB || 0,
};

const DEFAULT_TENANT_ID = 'default';

// Initialize Redis client
const redis = new Redis(REDIS_CONFIG);

/**
 * Set up Redis with default tenant
 */
async function setupRedis() {
  console.log('Setting up Redis...');
  
  // Set default tenant in Redis
  await redis.set('tenant:id', DEFAULT_TENANT_ID);
  console.log(`Set default tenant ID in Redis: ${DEFAULT_TENANT_ID}`);
  
  console.log('Redis setup complete.');
}

/**
 * Main setup function
 */
async function setup() {
  try {
    console.log('Starting development environment setup...');
    
    // Setup Redis
    await setupRedis();
    
    console.log('Development environment setup complete!');
    console.log('\nYou can now use the following test credentials:');
    console.log(`- Tenant ID: ${DEFAULT_TENANT_ID}`);
    
    // Close connections
    await redis.quit();
    
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    
    // Close connections
    await redis.quit();
    
    process.exit(1);
  }
}

// Run setup
setup();
