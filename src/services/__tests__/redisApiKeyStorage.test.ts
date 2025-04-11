import { ApiKey } from '@/types/apiKey';

// Use the mock implementation
jest.mock('../redisApiKeyStorage');
import { RedisApiKeyStorage } from '../redisApiKeyStorage';

describe('RedisApiKeyStorage', () => {
  let storage: RedisApiKeyStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new RedisApiKeyStorage();
  });

  afterEach(async () => {
    await storage.disconnect();
  });

  describe('getApiKeys', () => {
    it('should return an empty array when no keys exist', async () => {
      // Act
      const keys = await storage.getApiKeys();

      // Assert
      expect(keys).toEqual([]);
    });

    it('should return keys from Redis', async () => {
      // Arrange
      const mockKeys: ApiKey[] = [
        {
          id: 'test-id-1',
          name: 'Test Key 1',
          keyPrefix: 'nl_abcd',
          scopes: ['logs:write'],
          createdAt: new Date().toISOString(),
          lastUsedAt: null
        }
      ];

      await storage.saveApiKeys(mockKeys);

      // Act
      const keys = await storage.getApiKeys();

      // Assert
      expect(keys).toEqual(mockKeys);
    });
  });

  describe('saveApiKeys', () => {
    it('should save keys to Redis', async () => {
      // Arrange
      const mockKeys: ApiKey[] = [
        {
          id: 'test-id-1',
          name: 'Test Key 1',
          keyPrefix: 'nl_abcd',
          scopes: ['logs:write'],
          createdAt: new Date().toISOString(),
          lastUsedAt: null
        }
      ];

      // Act
      await storage.saveApiKeys(mockKeys);

      // Assert
      const savedKeys = await storage.getApiKeys();
      expect(savedKeys).toEqual(mockKeys);
    });
  });

  describe('createApiKey', () => {
    it('should create and store a new API key', async () => {
      // Arrange
      const name = 'Test API Key';
      const scopes = ['logs:write', 'logs:read'];

      // Act
      const { apiKey, keyData } = await storage.createApiKey(name, scopes);

      // Assert
      expect(apiKey).toMatch(/^nl_[a-zA-Z0-9]+-[a-zA-Z0-9-]+$/);
      expect(keyData.name).toBe(name);
      expect(keyData.scopes).toEqual(scopes);
      expect(keyData.keyPrefix).toBe(apiKey.substring(0, 8));

      // Check that it was stored
      const savedKeys = await storage.getApiKeys();
      expect(savedKeys).toHaveLength(1);
      expect(savedKeys[0].id).toBe(keyData.id);
    });
  });

  describe('revokeApiKey', () => {
    it('should remove an API key', async () => {
      // Arrange
      const mockKeys: ApiKey[] = [
        {
          id: 'test-id-1',
          name: 'Test Key 1',
          keyPrefix: 'nl_abcd',
          scopes: ['logs:write'],
          createdAt: new Date().toISOString(),
          lastUsedAt: null
        }
      ];

      await storage.saveApiKeys(mockKeys);

      // Act
      await storage.revokeApiKey('test-id-1');

      // Assert
      const savedKeys = await storage.getApiKeys();
      expect(savedKeys).toHaveLength(0);
    });

    it('should not fail when key does not exist', async () => {
      // Arrange
      const mockKeys: ApiKey[] = [
        {
          id: 'test-id-1',
          name: 'Test Key 1',
          keyPrefix: 'nl_abcd',
          scopes: ['logs:write'],
          createdAt: new Date().toISOString(),
          lastUsedAt: null
        }
      ];

      await storage.saveApiKeys(mockKeys);

      // Act & Assert
      await expect(storage.revokeApiKey('non-existent-id')).resolves.not.toThrow();

      // The keys should remain unchanged
      const savedKeys = await storage.getApiKeys();
      expect(savedKeys).toHaveLength(1);
    });
  });
});
