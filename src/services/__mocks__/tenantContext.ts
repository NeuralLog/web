/**
 * Mock implementation of the tenant context service
 */

// In-memory cache for the current tenant ID
let cachedTenantId: string | null = null;

/**
 * Get the current tenant ID
 * @returns The current tenant ID or null if not set
 */
export const getTenantId = jest.fn().mockImplementation(async (): Promise<string | null> => {
  return cachedTenantId || 'default';
});

/**
 * Set the current tenant ID
 * @param tenantId The tenant ID to set
 */
export const setTenantId = jest.fn().mockImplementation(async (tenantId: string): Promise<void> => {
  cachedTenantId = tenantId;
});

/**
 * Clear the tenant context
 */
export const clearTenantContext = jest.fn().mockImplementation(async (): Promise<void> => {
  cachedTenantId = null;
});

/**
 * Get the tenant ID synchronously (from cache only)
 * @returns The tenant ID or null if not found
 */
export const getTenantIdSync = jest.fn().mockImplementation((): string | null => {
  return cachedTenantId || 'default';
});
