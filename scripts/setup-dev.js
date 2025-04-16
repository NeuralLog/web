/**
 * Development Setup Script
 *
 * This script sets up the development environment by:
 * 1. Seeding Redis with a default tenant
 * 2. Creating an OpenFGA store and authorization model
 * 3. Creating a default tenant in OpenFGA
 * 4. Adding a test user to the default tenant
 */

const Redis = require('ioredis');
const { OpenFGAClient } = require('@openfga/sdk');
const { authorizationModel } = require('../src/models/authorizationModel');

// Configuration
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: process.env.REDIS_DB || 0,
};

const OPENFGA_CONFIG = {
  apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080',
};

const DEFAULT_TENANT_ID = 'default';
const TEST_USER_ID = 'test-user';

// Initialize Redis client
const redis = new Redis(REDIS_CONFIG);

// Initialize OpenFGA client
const openFgaClient = new OpenFGAClient(OPENFGA_CONFIG);

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
 * Set up OpenFGA with authorization model and default tenant
 */
async function setupOpenFGA() {
  console.log('Setting up OpenFGA...');

  try {
    // Create store if it doesn't exist
    console.log('Creating OpenFGA store...');
    const stores = await openFgaClient.listStores();

    let storeId;
    if (!stores.stores || stores.stores.length === 0) {
      const store = await openFgaClient.createStore({
        name: 'neurallog-store',
      });
      storeId = store.id;
      console.log(`Created new OpenFGA store with ID: ${storeId}`);
    } else {
      storeId = stores.stores[0].id;
      console.log(`Using existing OpenFGA store with ID: ${storeId}`);
    }

    // Update client with store ID
    openFgaClient.storeId = storeId;

    // Create authorization model
    console.log('Creating authorization model...');
    const model = await openFgaClient.writeAuthorizationModel({
      store_id: storeId,
      schema_version: '1.1',
      type_definitions: authorizationModel.type_definitions,
    });

    const modelId = model.authorization_model_id;
    console.log(`Created authorization model with ID: ${modelId}`);

    // Create default tenant
    console.log('Creating default tenant...');
    await openFgaClient.write({
      writes: {
        tuple_keys: [
          {
            user: `tenant:${DEFAULT_TENANT_ID}`,
            relation: 'exists',
            object: 'system:tenants',
          },
          {
            user: TEST_USER_ID,
            relation: 'admin',
            object: `tenant:${DEFAULT_TENANT_ID}`,
          },
          {
            user: TEST_USER_ID,
            relation: 'member',
            object: `tenant:${DEFAULT_TENANT_ID}`,
          },
        ],
      },
    });

    console.log(`Created default tenant: ${DEFAULT_TENANT_ID}`);
    console.log(`Added test user ${TEST_USER_ID} as admin of default tenant`);

    // Add some test permissions
    console.log('Adding test permissions...');
    await openFgaClient.write({
      writes: {
        tuple_keys: [
          {
            user: TEST_USER_ID,
            relation: 'read',
            object: 'log:system-logs',
          },
          {
            user: TEST_USER_ID,
            relation: 'write',
            object: 'log:system-logs',
          },
        ],
      },
    });

    console.log('Added test permissions for system logs');

    console.log('OpenFGA setup complete.');
  } catch (error) {
    console.error('Error setting up OpenFGA:', error);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setup() {
  try {
    console.log('Starting development environment setup...');

    // Setup Redis
    await setupRedis();

    // Setup OpenFGA
    await setupOpenFGA();

    console.log('Development environment setup complete!');
    console.log('\nYou can now use the following test credentials:');
    console.log(`- Tenant ID: ${DEFAULT_TENANT_ID}`);
    console.log(`- User ID: ${TEST_USER_ID}`);
    console.log('\nOpenFGA Playground: http://localhost:8080');

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
