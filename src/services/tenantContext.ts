/**
 * Tenant Context Service
 *
 * This service provides functions to get and set the current tenant ID.
 * The tenant ID is specific to the deployment and stored in Redis.
 *
 * In a multi-tenant environment with Kubernetes:
 * - Each tenant has its own namespace
 * - Each namespace has its own Redis instance
 * - The tenant ID is stored in Redis for that deployment
 */
import { MockRedisClient } from '@/lib/mockRedis';

// Initialize Redis client
let redisClient: any = null;

// In-memory cache for the current tenant ID (to avoid Redis lookups on every request)
let cachedTenantId: string | null = null;

// Redis key for tenant ID
const TENANT_ID_KEY = 'deployment:tenant_id';

// Default tenant ID for development
const DEFAULT_TENANT_ID = 'default';

/**
 * Get Redis client
 */
function getRedisClient(): any {
  if (!redisClient) {
    // Use a mock Redis client for client-side rendering
    redisClient = new MockRedisClient();
  }
  return redisClient;
}

/**
 * Get the current tenant ID
 * @returns The current tenant ID or null if not set
 */
export const getTenantId = async (): Promise<string | null> => {
  // For local development, always return the default tenant ID
  cachedTenantId = DEFAULT_TENANT_ID;
  return DEFAULT_TENANT_ID;
}

/**
 * Set the current tenant ID
 * @param tenantId The tenant ID to set
 */
export const setTenantId = async (tenantId: string): Promise<void> => {
  try {
    // Update the cache
    cachedTenantId = tenantId;

    // Store in Redis
    const redis = getRedisClient();
    await redis.set(TENANT_ID_KEY, tenantId);
  } catch (error) {
    console.error('Error setting tenant ID:', error);
  }
}

/**
 * Clear the tenant context asynchronously
 */
export const clearTenantContext = async (): Promise<void> => {
  try {
    // Clear the cache
    cachedTenantId = null;

    // Remove from Redis
    const redis = getRedisClient();
    await redis.del(TENANT_ID_KEY);
  } catch (error) {
    console.error('Error clearing tenant context:', error);
  }
}

/**
 * Clear the tenant context synchronously (only clears the cache)
 * This is useful for cleanup in useEffect
 */
export const clearTenantContextSync = (): void => {
  try {
    // Clear the cache
    cachedTenantId = null;

    // Note: We can't clear Redis synchronously, but that's usually fine for cleanup
    // The cache is the most important part to clear
  } catch (error) {
    console.error('Error clearing tenant context synchronously:', error);
  }
}

/**
 * Get the tenant ID synchronously (from cache only)
 * This is useful for components that can't use async functions
 * @returns The tenant ID or null if not found
 */
export const getTenantIdSync = (): string | null => {
  // If we have a cached tenant ID, return it
  if (cachedTenantId) {
    return cachedTenantId;
  }

  // If we're in a development environment, return the default tenant ID
  if (process.env.NODE_ENV === 'development') {
    return DEFAULT_TENANT_ID;
  }

  // No tenant ID in cache
  return null;
}
