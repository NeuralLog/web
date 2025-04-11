import { verifyApiKey } from '../apiKeyVerification';
import { getApiKeys } from '@/services/apiKeyService';

// Mock next/server module
jest.mock('next/server', () => {
  const mockJsonFn = jest.fn().mockImplementation((body, init) => ({
    status: init?.status || 200,
    json: async () => body
  }));

  return {
    NextResponse: {
      json: mockJsonFn
    }
  };
});

// Define NextResponse for use in tests
const NextResponse = { json: jest.fn() };

// Mock TextEncoder
global.TextEncoder = class {
  encode(text: string) {
    return new Uint8Array(Buffer.from(text));
  }
};

// Create a custom NextRequest class for testing
class NextRequest {
  headers: { get: jest.Mock };
  nextUrl: { pathname: string };

  constructor() {
    this.headers = { get: jest.fn() };
    this.nextUrl = { pathname: '/api/logs' };
  }
}

// Mock the API key service
jest.mock('@/services/apiKeyService', () => ({
  getApiKeys: jest.fn(),
}));

describe('API Key Verification Middleware', () => {
  let mockRequest: NextRequest;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock NextRequest
    mockRequest = {
      headers: {
        get: jest.fn(),
      },
      nextUrl: {
        pathname: '/api/logs',
      },
    } as unknown as NextRequest;

    // Mock next function
    mockNext = jest.fn();
  });

  it('should return 401 when no API key is provided', async () => {
    // Arrange
    (mockRequest.headers.get as jest.Mock).mockReturnValue(null);

    // Act
    const response = await verifyApiKey(mockRequest);

    // Assert
    expect(response).toBeTruthy();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'API key is required' });
  });

  it('should return 401 when API key is invalid', async () => {
    // Arrange
    (mockRequest.headers.get as jest.Mock).mockReturnValue('invalid-key');
    (getApiKeys as jest.Mock).mockResolvedValue([
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
    const response = await verifyApiKey(mockRequest);

    // Assert
    expect(response).toBeTruthy();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Invalid API key' });
  });

  it('should return 403 when API key does not have required scope', async () => {
    // Arrange
    const validKey = 'nl_abcdefghijklmnopqrstuvwxyz123456-abcdefghijklmnopqrstuvwxyz123456';
    (mockRequest.headers.get as jest.Mock).mockReturnValue(validKey);
    (getApiKeys as jest.Mock).mockResolvedValue([
      {
        id: 'key-1',
        name: 'Test Key',
        keyPrefix: validKey.substring(0, 8),
        scopes: ['logs:read'], // Missing logs:write scope
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
    ]);

    // Act
    const response = await verifyApiKey(mockRequest, ['logs:write']);

    // Assert
    expect(response).toBeTruthy();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Insufficient permissions' });
  });

  it('should update lastUsedAt when API key is valid', async () => {
    // Arrange
    const validKey = 'nl_abcdefghijklmnopqrstuvwxyz123456-abcdefghijklmnopqrstuvwxyz123456';
    (mockRequest.headers.get as jest.Mock).mockReturnValue(validKey);

    const mockUpdateApiKey = jest.fn();
    const mockApiKey = {
      id: 'key-1',
      name: 'Test Key',
      keyPrefix: validKey.substring(0, 8),
      scopes: ['logs:write', 'logs:read'],
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };

    (getApiKeys as jest.Mock).mockResolvedValue([
      { ...mockApiKey, updateLastUsed: mockUpdateApiKey },
    ]);

    // Act
    const response = await verifyApiKey(mockRequest, ['logs:write']);

    // Assert
    expect(response).toBeNull(); // Middleware passes through
    expect(mockUpdateApiKey).toHaveBeenCalled();
  });

  it('should verify API key using zero-knowledge proof', async () => {
    // Arrange
    const validKey = 'nl_abcdefghijklmnopqrstuvwxyz123456-abcdefghijklmnopqrstuvwxyz123456';
    const keyHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(validKey)
    );
    const keyHashHex = Array.from(new Uint8Array(keyHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Mock the request with a hashed key proof
    (mockRequest.headers.get as jest.Mock).mockImplementation((name) => {
      if (name === 'x-api-key') return validKey;
      if (name === 'x-api-key-proof') return keyHashHex;
      return null;
    });

    (getApiKeys as jest.Mock).mockResolvedValue([
      {
        id: 'key-1',
        name: 'Test Key',
        keyPrefix: validKey.substring(0, 8),
        scopes: ['logs:write', 'logs:read'],
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        updateLastUsed: jest.fn(),
      },
    ]);

    // Act
    const response = await verifyApiKey(mockRequest, ['logs:write'], true); // Enable ZKP

    // Assert
    expect(response).toBeNull(); // Middleware passes through
  });
});
