import { ApiKey } from '@/types/apiKey';
import {
  getApiKeys,
  createApiKey,
  revokeApiKey,
  clearApiKeys
} from '../apiKeyService';
import { getStorage, setStorage, StorageType } from '@/storage/storageInterface';
// Mock the fgaService functions
jest.mock('@/services/fgaService', () => ({
  registerApiKey: jest.fn().mockResolvedValue(undefined),
  generateApiKeyProof: jest.fn().mockResolvedValue('mock-proof')
}));

import { registerApiKey, generateApiKeyProof } from '@/services/fgaService';

describe('API Key Service', () => {
  beforeEach(() => {
    // Set up a fresh mock Redis adapter for each test
    setStorage(getStorage(StorageType.MockRedis));
    // Clear any in-memory cache
    clearApiKeys();
  });

  describe('getApiKeys', () => {
    it('should return an empty array when no keys exist', async () => {
      // Act
      const keys = await getApiKeys();

      // Assert
      expect(keys).toEqual([]);
    });

    it('should return keys from storage', async () => {
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

      await getStorage().set('apiKeys', mockKeys);

      // Act
      const keys = await getApiKeys();

      // Assert
      expect(keys).toEqual(mockKeys);
    });
  });

  describe('createApiKey', () => {
    it('should create and store a new API key', async () => {
      // Arrange
      const name = 'Test API Key';
      const scopes = ['logs:write', 'logs:read'];
      const userId = 'test-user-id';

      // Act
      const { apiKey, keyData, proof } = await createApiKey(name, scopes, userId);

      // Assert
      expect(apiKey).toMatch(/^nl_[a-zA-Z0-9]{32}-[a-zA-Z0-9]{32}$/);
      expect(keyData.name).toBe(name);
      expect(keyData.scopes).toEqual(scopes);
      expect(keyData.keyPrefix).toBe(apiKey.substring(0, 8));

      // Check that it was stored
      const storedKeys = await getStorage().get<ApiKey[]>('apiKeys');
      expect(storedKeys).toHaveLength(1);
      expect(storedKeys?.[0].id).toBe(keyData.id);

      // Check that the proof was generated
      expect(proof).toBe('mock-proof');

      // Check that the fgaService functions were called
      expect(registerApiKey).toHaveBeenCalledWith(keyData, userId);
      expect(generateApiKeyProof).toHaveBeenCalledWith(apiKey, userId);
    });
  });

  describe('revokeApiKey', () => {
    it('should remove an API key', async () => {
      // Arrange
      const { keyData } = await createApiKey('Test Key', ['logs:write']);

      // Act
      await revokeApiKey(keyData.id);

      // Assert
      const keys = await getApiKeys();
      expect(keys).toHaveLength(0);
    });

    it('should not fail when key does not exist', async () => {
      // Act & Assert
      await expect(revokeApiKey('non-existent-id')).resolves.not.toThrow();
    });
  });
});
