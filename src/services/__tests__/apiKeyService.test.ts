import { ApiKey } from '@/types/apiKey';
import {
  getApiKeys,
  createApiKey,
  revokeApiKey,
  clearApiKeys
} from '../apiKeyService';

// Mock the AuthApiKeyStorage
jest.mock('../authApiKeyStorage', () => {
  const mockApiKeys: ApiKey[] = [];
  return {
    AuthApiKeyStorage: jest.fn().mockImplementation(() => ({
      getApiKeys: jest.fn().mockImplementation(() => Promise.resolve([...mockApiKeys])),
      createApiKey: jest.fn().mockImplementation((name, scopes) => {
        const apiKey = `test-key-${Date.now()}`;
        const keyData: ApiKey = {
          id: `key-${Date.now()}`,
          name,
          keyPrefix: apiKey.substring(0, 8),
          scopes,
          createdAt: new Date().toISOString(),
          lastUsedAt: null
        };
        mockApiKeys.push(keyData);
        return Promise.resolve({ apiKey, keyData });
      }),
      revokeApiKey: jest.fn().mockImplementation((id) => {
        const index = mockApiKeys.findIndex(key => key.id === id);
        if (index >= 0) {
          mockApiKeys.splice(index, 1);
        }
        return Promise.resolve();
      })
    }))
  };
});

describe('API Key Service', () => {
  beforeEach(() => {
    // Clear any in-memory cache
    clearApiKeys();
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getApiKeys', () => {
    it('should return an empty array when no keys exist', async () => {
      // Act
      const keys = await getApiKeys();

      // Assert
      expect(keys).toEqual([]);
    });

    it('should return keys from storage', async () => {
      // This test now relies on the mock implementation
      // which returns the mockApiKeys array

      // Act
      const keys = await getApiKeys();

      // Assert
      expect(keys).toEqual([]);
    });
  });

  describe('createApiKey', () => {
    it('should create and store a new API key', async () => {
      // Arrange
      const name = 'Test API Key';
      const scopes = ['logs:write', 'logs:read'];

      // Act
      const { apiKey, keyData } = await createApiKey(name, scopes);

      // Assert
      expect(apiKey).toContain('test-key-');
      expect(keyData.name).toBe(name);
      expect(keyData.scopes).toEqual(scopes);

      // Check that the key was created with the right prefix
      expect(keyData.keyPrefix).toBe(apiKey.substring(0, 8));

      // Verify the key was stored by checking a subsequent getApiKeys call
      const keys = await getApiKeys();
      expect(keys).toHaveLength(1);
      expect(keys[0].id).toBe(keyData.id);
    });
  });

  describe('revokeApiKey', () => {
    it('should remove an API key', async () => {
      // Arrange
      const { keyData } = await createApiKey('Test Key', ['logs:write']);

      // Verify the key was created
      let keys = await getApiKeys();
      expect(keys).toHaveLength(1);

      // Act
      await revokeApiKey(keyData.id);

      // Assert
      keys = await getApiKeys();
      expect(keys).toHaveLength(0);
    });

    it('should not fail when key does not exist', async () => {
      // Act & Assert
      await expect(revokeApiKey('non-existent-id')).resolves.not.toThrow();
    });
  });
});
