/**
 * Mock Redis adapter that uses in-memory storage
 * This is used for testing when Redis is not available
 */
import { StorageInterface } from './storageInterface';

export class MockRedisAdapter implements StorageInterface {
  private storage: Map<string, string> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const value = this.storage.get(key);
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
    this.storage.set(key, JSON.stringify(value));
  }
  
  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  // Additional Redis-specific methods that might be needed
  async connect(): Promise<void> {
    // No-op for mock
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    // No-op for mock
    return Promise.resolve();
  }

  // Clear all data (useful for testing)
  async clear(): Promise<void> {
    this.storage.clear();
    return Promise.resolve();
  }
}
