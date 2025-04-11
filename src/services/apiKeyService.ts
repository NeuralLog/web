import { ApiKey } from '@/types/apiKey';
import { AuthApiKeyStorage } from './authApiKeyStorage';

// In-memory cache of API keys
let apiKeysCache: ApiKey[] | null = null;

/**
 * Clears the in-memory cache of API keys
 * Used primarily for testing
 */
export function clearApiKeys(): void {
  apiKeysCache = null;
}

/**
 * Gets all API keys from the auth service
 * @returns Array of API keys
 */
export async function getApiKeys(): Promise<ApiKey[]> {
  // Return from cache if available
  if (apiKeysCache !== null) {
    return apiKeysCache;
  }

  // Get from auth service
  const storage = new AuthApiKeyStorage();
  const keys = await storage.getApiKeys();

  // Cache the keys
  apiKeysCache = keys;
  return keys;
}

/**
 * Creates a new API key
 * @param name Name of the API key
 * @param scopes Scopes for the API key
 * @returns The full API key and the key data
 */
export async function createApiKey(name: string, scopes: string[]): Promise<{ apiKey: string, keyData: ApiKey }> {
  // Create a new API key using the auth service
  const storage = new AuthApiKeyStorage();
  const result = await storage.createApiKey(name, scopes);

  // Clear the cache to force a refresh on next getApiKeys call
  clearApiKeys();

  return result;
}

/**
 * Revokes (deletes) an API key
 * @param keyId ID of the API key to revoke
 */
export async function revokeApiKey(keyId: string): Promise<void> {
  // Revoke the API key using the auth service
  const storage = new AuthApiKeyStorage();
  await storage.revokeApiKey(keyId);

  // Clear the cache to force a refresh on next getApiKeys call
  clearApiKeys();
}
