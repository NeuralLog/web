/**
 * Tenant Context Service
 *
 * This service provides functions to get and set the tenant ID.
 * In a production environment, the tenant ID is determined by the subdomain.
 * In a development environment, the tenant ID is stored in Redis.
 */

// In-memory cache for tenant ID
let cachedTenantId = null;

// Only import Redis on the server side
let Redis = null;
let redisClient = null;

// Check if we're in a server environment
if (typeof window === 'undefined') {
  try {
    // Dynamic import to avoid issues with browser bundling
    Redis = require('ioredis');
  } catch (error) {
    console.warn('Redis not available:', error.message);
  }
}

/**
 * Initialize Redis client
 */
function getRedisClient() {
  // Only create Redis client on the server
  if (typeof window === 'undefined' && Redis && !redisClient) {
    try {
      redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || '',
        db: process.env.REDIS_DB || 0,
      });
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
    }
  }
  return redisClient;
}

/**
 * Get tenant ID synchronously from cache
 * @returns {string|null} Tenant ID or null if not cached
 */
export function getTenantIdSync() {
  // If we have a cached tenant ID, return it
  if (cachedTenantId) {
    return cachedTenantId;
  }

  // If we're in a browser environment, check for TENANT_ID in localStorage
  if (typeof window !== 'undefined') {
    const storedTenantId = localStorage.getItem('TENANT_ID');
    if (storedTenantId) {
      cachedTenantId = storedTenantId;
      return storedTenantId;
    }
  }

  // If we're in a Node.js environment, check for TENANT_ID in environment variables
  if (typeof process !== 'undefined' && process.env) {
    const envTenantId = process.env.TENANT_ID;
    if (envTenantId) {
      cachedTenantId = envTenantId;
      return envTenantId;
    }
  }

  // Default to 'default' tenant in development
  if (process.env.NODE_ENV === 'development') {
    cachedTenantId = 'default';
    return 'default';
  }

  return null;
}

/**
 * Get tenant ID asynchronously
 * @returns {Promise<string>} Tenant ID
 */
export async function getTenantId() {
  // If we have a cached tenant ID, return it
  if (cachedTenantId) {
    return cachedTenantId;
  }

  // If we're in a browser environment, check for TENANT_ID in localStorage
  if (typeof window !== 'undefined') {
    const storedTenantId = localStorage.getItem('TENANT_ID');
    if (storedTenantId) {
      cachedTenantId = storedTenantId;
      return storedTenantId;
    }
  }

  try {
    // Try to get tenant ID from Redis if available
    const redis = getRedisClient();
    if (redis) {
      const tenantId = await redis.get('tenant:id');

      if (tenantId) {
        cachedTenantId = tenantId;

        // Store in localStorage if in browser environment
        if (typeof window !== 'undefined') {
          localStorage.setItem('TENANT_ID', tenantId);
        }

        return tenantId;
      }
    }

    // Default to 'default' tenant in development
    if (process.env.NODE_ENV === 'development') {
      cachedTenantId = 'default';

      // Store in localStorage if in browser environment
      if (typeof window !== 'undefined') {
        localStorage.setItem('TENANT_ID', 'default');
      }

      return 'default';
    }

    throw new Error('Tenant ID not found');
  } catch (error) {
    console.error('Error getting tenant ID:', error);

    // Default to 'default' tenant in development
    if (process.env.NODE_ENV === 'development') {
      return 'default';
    }

    throw error;
  }
}

/**
 * Set tenant ID
 * @param {string} tenantId Tenant ID
 * @returns {Promise<void>}
 */
export async function setTenantId(tenantId) {
  try {
    // Set tenant ID in Redis
    const redis = getRedisClient();
    if (redis) {
      await redis.set('tenant:id', tenantId);
    }

    // Update cache
    cachedTenantId = tenantId;

    // Store in localStorage if in browser environment
    if (typeof window !== 'undefined') {
      localStorage.setItem('TENANT_ID', tenantId);
    }
  } catch (error) {
    console.error('Error setting tenant ID:', error);
    throw error;
  }
}

/**
 * Clear tenant context
 * @returns {Promise<void>}
 */
export async function clearTenantContext() {
  try {
    // Clear cache
    cachedTenantId = null;

    // Clear localStorage if in browser environment
    if (typeof window !== 'undefined') {
      localStorage.removeItem('TENANT_ID');
    }

    // Clear Redis if available
    const redis = getRedisClient();
    if (redis) {
      await redis.del('tenant:id');
    }
  } catch (error) {
    console.error('Error clearing tenant context:', error);
    throw error;
  }
}
