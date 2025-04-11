import { ApiKey } from '@/types/apiKey';
import { generateApiKey } from '@/utils/apiKey';
import { getStorage } from '@/storage/storageInterface';
import { registerApiKey, generateApiKeyProof } from '@/services/fgaService';

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
 * Gets all API keys from storage
 * @returns Array of API keys
 */
export async function getApiKeys(): Promise<ApiKey[]> {
  // Return from cache if available
  if (apiKeysCache !== null) {
    return apiKeysCache;
  }

  // Get from storage
  const storage = getStorage();
  const keys = await storage.get<ApiKey[]>('apiKeys');

  if (keys) {
    apiKeysCache = keys;
    return keys;
  }

  // Default to empty array
  apiKeysCache = [];
  return apiKeysCache;
}

/**
 * Saves API keys to storage
 * @param keys Array of API keys to save
 */
async function saveApiKeys(keys: ApiKey[]): Promise<void> {
  const storage = getStorage();
  await storage.set('apiKeys', keys);
  apiKeysCache = keys;
}

/**
 * Creates a new API key
 * @param name Name of the API key
 * @param scopes Scopes for the API key
 * @returns The full API key and the key data
 */
export async function createApiKey(name: string, scopes: string[], userId: string = 'system'): Promise<{ apiKey: string, keyData: ApiKey, proof: string }> {
  const apiKey = generateApiKey();

  const keyData: ApiKey = {
    id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
    name,
    keyPrefix: apiKey.substring(0, 8),
    scopes,
    createdAt: new Date().toISOString(),
    lastUsedAt: null
  };

  const keys = await getApiKeys();
  keys.push(keyData);
  await saveApiKeys(keys);

  // Register the API key with OpenFGA
  await registerApiKey(keyData, userId);

  // Generate a proof for the API key
  const proof = await generateApiKeyProof(apiKey, userId);

  return { apiKey, keyData, proof };
}

/**
 * Revokes (deletes) an API key
 * @param keyId ID of the API key to revoke
 */
export async function revokeApiKey(keyId: string): Promise<void> {
  const keys = await getApiKeys();
  const updatedKeys = keys.filter(key => key.id !== keyId);

  if (updatedKeys.length !== keys.length) {
    await saveApiKeys(updatedKeys);
  }
}
