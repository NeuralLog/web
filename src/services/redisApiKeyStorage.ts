import { ApiKey } from '@/types/apiKey';
import { ApiKeyStorage } from '@/types/apiKeyStorage';
import IORedis from 'ioredis';
import crypto from 'crypto';

export class RedisApiKeyStorage implements ApiKeyStorage {
  private client: IORedis;
  private readonly keyPrefix = 'nl_';
  private readonly apiKeysKey = 'apiKeys';

  constructor() {
    this.client = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async connect(): Promise<void> {
    // Redis client automatically connects when created
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  async getApiKeys(): Promise<ApiKey[]> {
    const keysJson = await this.client.get(this.apiKeysKey);
    if (!keysJson) {
      return [];
    }
    return JSON.parse(keysJson);
  }

  async saveApiKeys(keys: ApiKey[]): Promise<void> {
    await this.client.set(this.apiKeysKey, JSON.stringify(keys));
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
    const existingKeys = await this.getApiKeys();
    existingKeys.push(keyData);
    await this.saveApiKeys(existingKeys);

    return { apiKey: fullKey, keyData };
  }

  async revokeApiKey(id: string): Promise<void> {
    const keys = await this.getApiKeys();
    const filteredKeys = keys.filter(key => key.id !== id);
    await this.saveApiKeys(filteredKeys);
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    const keys = await this.getApiKeys();
    const keyIndex = keys.findIndex(key => key.id === id);

    if (keyIndex >= 0) {
      keys[keyIndex].lastUsedAt = new Date().toISOString();
      await this.saveApiKeys(keys);
    }
  }
}
