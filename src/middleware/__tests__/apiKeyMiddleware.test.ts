import { NextRequest, NextResponse } from 'next/server';
import { apiKeyMiddleware } from '../apiKeyMiddleware';
import { verifyApiKey } from '@/auth/apiKeyVerification';

// Mock the API key verification
jest.mock('@/auth/apiKeyVerification', () => ({
  verifyApiKey: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((body, init) => ({
        status: init?.status || 200,
        json: async () => body,
      })),
    },
    NextRequest: jest.fn().mockImplementation(() => ({
      headers: {
        get: jest.fn(),
      },
    })),
  };
});

describe('API Key Middleware', () => {
  let mockRequest: NextRequest;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock NextRequest
    mockRequest = new NextRequest();
    (mockRequest.headers.get as jest.Mock).mockImplementation((name) => {
      if (name === 'x-api-key') return 'test-api-key';
      if (name === 'x-api-key-proof') return null;
      return null;
    });
  });
  
  it('should return 401 when API key is invalid', async () => {
    // Arrange
    (verifyApiKey as jest.Mock).mockResolvedValue({
      isValid: false,
      error: 'Invalid API key',
    });
    
    // Act
    const response = await apiKeyMiddleware(mockRequest);
    
    // Assert
    expect(response).not.toBeNull();
    expect(response?.status).toBe(401);
    expect(await response?.json()).toEqual({ error: 'Invalid API key' });
  });
  
  it('should return 403 when API key does not have required scope', async () => {
    // Arrange
    (verifyApiKey as jest.Mock).mockResolvedValue({
      isValid: false,
      error: 'Insufficient permissions',
    });
    
    // Act
    const response = await apiKeyMiddleware(mockRequest, ['logs:write']);
    
    // Assert
    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);
    expect(await response?.json()).toEqual({ error: 'Insufficient permissions' });
  });
  
  it('should return null when API key is valid', async () => {
    // Arrange
    (verifyApiKey as jest.Mock).mockResolvedValue({
      isValid: true,
      apiKey: {
        id: 'key-1',
        name: 'Test Key',
        keyPrefix: 'nl_abcd',
        scopes: ['logs:write', 'logs:read'],
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
    });
    
    // Act
    const response = await apiKeyMiddleware(mockRequest);
    
    // Assert
    expect(response).toBeNull();
  });
  
  it('should use zero-knowledge proof when provided', async () => {
    // Arrange
    (mockRequest.headers.get as jest.Mock).mockImplementation((name) => {
      if (name === 'x-api-key') return 'test-api-key';
      if (name === 'x-api-key-proof') return 'test-proof';
      return null;
    });
    
    (verifyApiKey as jest.Mock).mockResolvedValue({
      isValid: true,
      apiKey: {
        id: 'key-1',
        name: 'Test Key',
        keyPrefix: 'nl_abcd',
        scopes: ['logs:write', 'logs:read'],
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
    });
    
    // Act
    const response = await apiKeyMiddleware(mockRequest);
    
    // Assert
    expect(verifyApiKey).toHaveBeenCalledWith('test-api-key', [], {
      useZkp: true,
      proof: 'test-proof',
    });
    expect(response).toBeNull();
  });
});
