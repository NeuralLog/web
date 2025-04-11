import { ApiKey } from '@/types/apiKey';
import { ApiKeyStorage } from '@/types/apiKeyStorage';
import crypto from 'crypto';

export class RedisApiKeyStorage implements ApiKeyStorage {
  private apiKeys: ApiKey[] = [];
  private readonly keyPrefix = 'nl_';

  constructor() {
    // No Redis client in the mock
  }

  async connect(): Promise<void> {
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    return Promise.resolve();
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return this.apiKeys;
  }

  async saveApiKeys(keys: ApiKey[]): Promise<void> {
    this.apiKeys = keys;
  }

  async createApiKey(name: string, scopes: string[]): Promise<{ apiKey: string; keyData: ApiKey }> {
    // Generate a random API key
    const keyId = crypto.randomUUID();
    const keySecret = crypto.randomBytes(16).toString('hex');
    const fullKey = `${this.keyPrefix}${keySecret}-${keyId}`;
    
    // Create the key data to store
    const keyData: ApiKey = {
      id: keyId,
      name,
      keyPrefix: fullKey.substring(0, 8),
      scopes,
      createdAt: new Date().toISOString(),
      lastUsedAt: null
    };
    
    // Store the key
    this.apiKeys.push(keyData);
    
    return { apiKey: fullKey, keyData };
  }

  async revokeApiKey(id: string): Promise<void> {
    this.apiKeys = this.apiKeys.filter(key => key.id !== id);
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    const keyIndex = this.apiKeys.findIndex(key => key.id === id);
    
    if (keyIndex >= 0) {
      this.apiKeys[keyIndex].lastUsedAt = new Date().toISOString();
    }
  }
}
