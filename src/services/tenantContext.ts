/**
 * Tenant Context Service
 *
 * This service provides functions to get and set the current tenant ID.
 * The tenant ID is specific to the deployment and provided via environment variables.
 *
 * In a multi-tenant environment with Kubernetes:
 * - Each tenant has its own namespace
 * - Each deployment has its own environment variables
 * - The tenant ID is set as an environment variable for that deployment
 */

// In-memory cache for the current tenant ID
let cachedTenantId: string | null = null;

// Default tenant ID from environment variable
const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default';

/**
 * Get the current tenant ID
 * @returns The current tenant ID or null if not set
 */
export const getTenantId = async (): Promise<string | null> => {
  // Check cache first
  if (cachedTenantId) {
    return cachedTenantId;
  }

  // Use the environment variable
  cachedTenantId = DEFAULT_TENANT_ID;
  return DEFAULT_TENANT_ID;
}

/**
 * Set the current tenant ID
 * @param tenantId The tenant ID to set
 */
export const setTenantId = async (tenantId: string): Promise<void> => {
  try {
    // Update the cache only
    cachedTenantId = tenantId;
    console.warn('Setting tenant ID in memory only. In production, use environment variables.');
  } catch (error) {
    console.error('Error setting tenant ID:', error);
  }
}

/**
 * Clear the tenant context asynchronously
 */
export const clearTenantContext = async (): Promise<void> => {
  try {
    // Clear the cache only
    cachedTenantId = null;
    console.warn('Clearing tenant ID in memory only. In production, use environment variables.');
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
  } catch (error) {
    console.error('Error clearing tenant context synchronously:', error);
  }
}

/**
 * Get the tenant ID synchronously
 * This is useful for components that can't use async functions
 * @returns The tenant ID from environment variable or cache
 */
export const getTenantIdSync = (): string => {
  // If we have a cached tenant ID, return it
  if (cachedTenantId) {
    return cachedTenantId;
  }

  // Return the default tenant ID from environment variable
  return DEFAULT_TENANT_ID;
}
