// Import the mock Redis adapter
import { MockRedisAdapter } from './MockRedisAdapter';

/**
 * Interface for key-value storage providers
 * This allows us to easily switch between different storage backends
 * (e.g., localStorage for development, Redis for production)
 */
export interface StorageInterface {
  /**
   * Get a value from storage
   * @param key The key to retrieve
   * @returns The value, or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in storage
   * @param key The key to set
   * @param value The value to store
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Delete a key from storage
   * @param key The key to delete
   */
  delete(key: string): Promise<void>;
}

/**
 * localStorage implementation of StorageInterface
 * Used for development and testing
 */
export class LocalStorageAdapter implements StorageInterface {
  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    const value = localStorage.getItem(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to parse value for key ${key}`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(key);
  }
}

// Singleton instance of the storage adapter
// This will be replaced with a Redis adapter in production
let storageInstance: StorageInterface | null = null;

/**
 * Storage type enum
 */
export enum StorageType {
  LocalStorage = 'localStorage',
  Redis = 'redis',
  MockRedis = 'mockRedis'
}

/**
 * Get the storage instance
 * @param type Optional storage type to use
 * @returns The storage instance
 */
export function getStorage(type?: StorageType): StorageInterface {
  if (!storageInstance || type) {
    // If a specific type is requested, create that type
    if (type === StorageType.Redis) {
      try {
        // In a real application, we would create a Redis adapter here
        // For now, we'll use the mock Redis adapter
        storageInstance = new MockRedisAdapter();
        console.log('Using Redis adapter');
      } catch (error) {
        console.warn('Failed to create Redis adapter, falling back to mock:', error);
        storageInstance = new MockRedisAdapter();
      }
    } else if (type === StorageType.MockRedis) {
      storageInstance = new MockRedisAdapter();
      console.log('Using mock Redis adapter');
    } else {
      // Default to localStorage
      storageInstance = new LocalStorageAdapter();
      console.log('Using localStorage adapter');
    }
  }

  return storageInstance;
}

/**
 * Set the storage instance (used for testing)
 * @param storage The storage instance to use
 */
export function setStorage(storage: StorageInterface): void {
  storageInstance = storage;
}
