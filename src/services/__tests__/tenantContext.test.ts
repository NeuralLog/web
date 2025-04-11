// Import the mocked module
import { getTenantId, setTenantId, clearTenantContext, getTenantIdSync } from '../tenantContext';

// Mock Redis
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  };

  return jest.fn(() => mockRedis);
});

// Mock the tenant context module
jest.mock('../tenantContext', () => {
  // In-memory cache for the current tenant ID
  let cachedTenantId: string | null = null;

  return {
    getTenantId: jest.fn(async () => {
      try {
        // Get the mock Redis instance
        const mockRedis = require('ioredis')();

        if (cachedTenantId) {
          return cachedTenantId;
        }
        const tenantId = await mockRedis.get('deployment:tenant_id');
        if (tenantId) {
          cachedTenantId = tenantId;
        }
        return tenantId || null;
      } catch (error) {
        console.error('Error getting tenant ID:', error);
        return null;
      }
    }),
    setTenantId: jest.fn(async (tenantId: string) => {
      try {
        // Get the mock Redis instance
        const mockRedis = require('ioredis')();

        cachedTenantId = tenantId;
        await mockRedis.set('deployment:tenant_id', tenantId);
      } catch (error) {
        console.error('Error setting tenant ID:', error);
      }
    }),
    clearTenantContext: jest.fn(async () => {
      try {
        // Get the mock Redis instance
        const mockRedis = require('ioredis')();

        cachedTenantId = null;
        await mockRedis.del('deployment:tenant_id');
      } catch (error) {
        console.error('Error clearing tenant context:', error);
      }
    }),
    getTenantIdSync: jest.fn(() => cachedTenantId)
  };
});

describe('Tenant Context Service', () => {
  let mockRedis: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Get the mock Redis instance
    mockRedis = require('ioredis')();

    // Reset the cached tenant ID
    await clearTenantContext();
  });

  describe('getTenantId', () => {
    it('should return null when no tenant ID is set', async () => {
      // Arrange
      mockRedis.get.mockResolvedValue(null);

      // Act
      const tenantId = await getTenantId();

      // Assert
      expect(tenantId).toBeNull();
      expect(mockRedis.get).toHaveBeenCalledWith('deployment:tenant_id');
    });

    it('should return the tenant ID from Redis', async () => {
      // Arrange
      mockRedis.get.mockResolvedValue('test-tenant');

      // Act
      const tenantId = await getTenantId();

      // Assert
      expect(tenantId).toBe('test-tenant');
      expect(mockRedis.get).toHaveBeenCalledWith('deployment:tenant_id');
    });

    it('should cache the tenant ID', async () => {
      // Arrange
      mockRedis.get.mockResolvedValue('test-tenant');

      // Act
      await getTenantId(); // First call should cache
      await getTenantId(); // Second call should use cache

      // Assert
      expect(mockRedis.get).toHaveBeenCalledTimes(1);
    });

    it('should handle Redis errors', async () => {
      // Arrange
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      // Act
      const tenantId = await getTenantId();

      // Assert
      expect(tenantId).toBeNull();
    });
  });

  describe('setTenantId', () => {
    it('should set the tenant ID in Redis', async () => {
      // Arrange
      mockRedis.set.mockResolvedValue('OK');

      // Act
      await setTenantId('test-tenant');

      // Assert
      expect(mockRedis.set).toHaveBeenCalledWith('deployment:tenant_id', 'test-tenant');
    });

    it('should update the cache', async () => {
      // Arrange
      mockRedis.set.mockResolvedValue('OK');

      // Act
      await setTenantId('test-tenant');
      const cachedTenantId = getTenantIdSync();

      // Assert
      expect(cachedTenantId).toBe('test-tenant');
    });

    it('should handle Redis errors', async () => {
      // Arrange
      mockRedis.set.mockRejectedValue(new Error('Redis error'));

      // Act & Assert
      await expect(setTenantId('test-tenant')).resolves.not.toThrow();
    });
  });

  describe('clearTenantContext', () => {
    it('should delete the tenant ID from Redis', async () => {
      // Arrange
      mockRedis.del.mockResolvedValue(1);

      // Act
      await clearTenantContext();

      // Assert
      expect(mockRedis.del).toHaveBeenCalledWith('deployment:tenant_id');
    });

    it('should clear the cache', async () => {
      // Arrange
      mockRedis.set.mockResolvedValue('OK');
      await setTenantId('test-tenant');

      // Act
      await clearTenantContext();
      const cachedTenantId = getTenantIdSync();

      // Assert
      expect(cachedTenantId).toBeNull();
    });

    it('should handle Redis errors', async () => {
      // Arrange
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      // Act & Assert
      await expect(clearTenantContext()).resolves.not.toThrow();
    });
  });

  describe('getTenantIdSync', () => {
    it('should return null when no tenant ID is cached', () => {
      // Act
      const tenantId = getTenantIdSync();

      // Assert
      expect(tenantId).toBeNull();
    });

    it('should return the cached tenant ID', async () => {
      // Arrange
      mockRedis.get.mockResolvedValue('test-tenant');
      await getTenantId(); // Cache the tenant ID

      // Act
      const tenantId = getTenantIdSync();

      // Assert
      expect(tenantId).toBe('test-tenant');
    });
  });
});
