/**
 * Auth Cache Service
 */

import { Permission, ResourceType } from './types';

// Default cache TTL in milliseconds
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Cache entry
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Auth cache service
 */
export class AuthCache {
  private cache: Map<string, CacheEntry<any>>;
  private ttl: number;
  
  constructor(ttl: number = DEFAULT_CACHE_TTL) {
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  /**
   * Generate a cache key for a permission check
   */
  public getPermissionCacheKey(
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string,
    tenantId: string
  ): string {
    return `${userId}:${permission}:${resourceType}:${resourceId}:${tenantId}`;
  }
  
  /**
   * Get a value from the cache
   */
  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if the entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  /**
   * Set a value in the cache
   */
  public set<T>(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }
  
  /**
   * Delete a value from the cache
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
  }
  
  /**
   * Invalidate cache entries for a specific tenant
   */
  public invalidateTenant(tenantId: string): void {
    for (const key of this.cache.keys()) {
      if (key.endsWith(`:${tenantId}`)) {
        this.cache.delete(key);
      }
    }
  }
}
