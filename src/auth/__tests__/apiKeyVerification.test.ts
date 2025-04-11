import { jest } from '@jest/globals';

// Create mock functions
const mockGetApiKeys = jest.fn();

// Mock the API key service
jest.mock('@/services/apiKeyService', () => ({
  getApiKeys: () => mockGetApiKeys()
}));

// Import the module after mocking
import { verifyApiKey } from '../apiKeyVerification';

describe('API Key Verification', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockGetApiKeys.mockReset();
  });

  it('should return false when no API key is provided', async () => {
    // Act
    const result = await verifyApiKey('');

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('API key is required');
  });

  it('should return false when API key is invalid', async () => {
    // Arrange
    mockGetApiKeys.mockResolvedValue([
      {
        id: 'key-1',
        name: 'Test Key',
        keyPrefix: 'nl_abcd',
        scopes: ['logs:write'],
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
    ]);

    // Act
    const result = await verifyApiKey('invalid-key');

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid API key');
  });
});
