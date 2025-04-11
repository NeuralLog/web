/**
 * NeuralLog Auth Client
 *
 * This client provides authentication and authorization functionality
 * for the NeuralLog web application. It uses the auth service API
 * and respects the tenant context from the tenant service.
 */

import { getTenantId, getTenantIdSync } from '@/services/tenantContext';
import { AuthApiClient } from './api-client';
import { AuthCache } from './cache';
import { Permission, ResourceType, AuthClientOptions } from './types';

export class AuthClient {
  private apiClient: AuthApiClient;
  private cache: AuthCache;
  private apiUrl: string;
  private currentTenantId: string | null = null;
  private apiKey: string;

  constructor(options: AuthClientOptions = {}) {
    // Set API URL
    this.apiUrl = options.apiUrl || process.env.NEXT_PUBLIC_AUTH_SERVICE_API_URL || 'http://localhost:3040';

    // Set API key
    this.apiKey = options.apiKey || process.env.NEXT_PUBLIC_AUTH_SERVICE_API_KEY || '';

    // Initialize cache with optional TTL
    this.cache = new AuthCache(options.cacheTtl);

    // Initialize API client with default values
    this.apiClient = new AuthApiClient({
      apiUrl: this.apiUrl,
      apiKey: this.apiKey,
      tenantId: 'default' // Will be updated when tenant ID is set
    });

    // Try to get the tenant ID synchronously
    const syncTenantId = getTenantIdSync();
    if (syncTenantId) {
      this.setTenantId(syncTenantId);
    }
  }

  /**
   * Initialize the auth client
   */
  public async initialize(): Promise<void> {
    // Get the tenant ID if not already set
    if (!this.currentTenantId) {
      const tenantId = await getTenantId();
      if (tenantId) {
        this.setTenantId(tenantId);
      } else {
        // Use default tenant if no tenant ID is available
        this.setTenantId('default');
      }
    }

    // Validate required fields
    if (!this.apiKey && process.env.NODE_ENV === 'production') {
      console.warn('No API key provided for auth service. This may cause authentication issues in production.');
    }

    console.log(`Auth client initialized for tenant: ${this.currentTenantId}`);
  }

  /**
   * Set the tenant ID
   * @param tenantId Tenant ID
   */
  public setTenantId(tenantId: string): void {
    if (this.currentTenantId === tenantId) {
      return;
    }

    this.currentTenantId = tenantId;

    // Update the API client with the new tenant ID
    this.apiClient.setTenantId(tenantId);

    console.log(`Using auth service at ${this.apiUrl} for tenant ${tenantId}`);
  }

  /**
   * Check if a user has permission to access a resource
   * @param userId User ID
   * @param permission Permission to check
   * @param resourceType Resource type
   * @param resourceId Resource ID
   */
  public async check(
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<boolean> {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID not set. Call initialize() first.');
    }

    // Generate cache key
    const cacheKey = this.cache.getPermissionCacheKey(
      userId,
      permission,
      resourceType,
      resourceId,
      this.currentTenantId
    );

    // Check cache first
    const cachedResult = this.cache.get<boolean>(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    try {
      // Add tenant context to contextual tuples
      const contextualTuples = [
        {
          user: userId,
          relation: 'member',
          object: `tenant:${this.currentTenantId}`,
        },
      ];

      // Check permission
      const result = await this.apiClient.check({
        user: userId,
        relation: permission,
        object: `${resourceType}:${resourceId}`,
        contextualTuples,
      });

      // Cache the result
      this.cache.set(cacheKey, result.allowed);

      return result.allowed;
    } catch (error) {
      console.error('Error checking permission', { error, userId, permission, resourceType, resourceId });
      return false;
    }
  }

  /**
   * Grant a permission to a user
   * @param userId User ID
   * @param permission Permission to grant
   * @param resourceType Resource type
   * @param resourceId Resource ID
   */
  public async grant(
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<boolean> {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID not set. Call initialize() first.');
    }

    try {
      // Grant permission
      const result = await this.apiClient.grant({
        user: userId,
        relation: permission,
        object: `${resourceType}:${resourceId}`,
      });

      // Invalidate cache
      const cacheKey = this.cache.getPermissionCacheKey(
        userId,
        permission,
        resourceType,
        resourceId,
        this.currentTenantId
      );
      this.cache.delete(cacheKey);

      return result.success;
    } catch (error) {
      console.error('Error granting permission', { error, userId, permission, resourceType, resourceId });
      return false;
    }
  }

  /**
   * Revoke a permission from a user
   * @param userId User ID
   * @param permission Permission to revoke
   * @param resourceType Resource type
   * @param resourceId Resource ID
   */
  public async revoke(
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<boolean> {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID not set. Call initialize() first.');
    }

    try {
      // Revoke permission
      const result = await this.apiClient.revoke({
        user: userId,
        relation: permission,
        object: `${resourceType}:${resourceId}`,
      });

      // Invalidate cache
      const cacheKey = this.cache.getPermissionCacheKey(
        userId,
        permission,
        resourceType,
        resourceId,
        this.currentTenantId
      );
      this.cache.delete(cacheKey);

      return result.success;
    } catch (error) {
      console.error('Error revoking permission', { error, userId, permission, resourceType, resourceId });
      return false;
    }
  }

  /**
   * Check if a user is a member of a tenant
   * @param userId User ID
   */
  public async isUserInTenant(userId: string): Promise<boolean> {
    return this.check(
      userId,
      Permission.MEMBER,
      ResourceType.TENANT,
      this.currentTenantId || 'default'
    );
  }

  /**
   * Check if a user is an admin of a tenant
   * @param userId User ID
   */
  public async isUserTenantAdmin(userId: string): Promise<boolean> {
    return this.check(
      userId,
      Permission.ADMIN,
      ResourceType.TENANT,
      this.currentTenantId || 'default'
    );
  }

  /**
   * Add a user to a tenant
   * @param userId User ID
   * @param isAdmin Whether the user should be an admin
   */
  public async addUserToTenant(userId: string, isAdmin: boolean = false): Promise<boolean> {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID not set. Call initialize() first.');
    }

    try {
      // Add user as member
      const memberResult = await this.grant(
        userId,
        Permission.MEMBER,
        ResourceType.TENANT,
        this.currentTenantId
      );

      // If user should be admin, add admin permission
      if (isAdmin) {
        const adminResult = await this.grant(
          userId,
          Permission.ADMIN,
          ResourceType.TENANT,
          this.currentTenantId
        );

        return memberResult && adminResult;
      }

      return memberResult;
    } catch (error) {
      console.error('Error adding user to tenant', { error, userId, isAdmin });
      return false;
    }
  }

  /**
   * Remove a user from a tenant
   * @param userId User ID
   */
  public async removeUserFromTenant(userId: string): Promise<boolean> {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID not set. Call initialize() first.');
    }

    try {
      // Remove member permission
      const memberResult = await this.revoke(
        userId,
        Permission.MEMBER,
        ResourceType.TENANT,
        this.currentTenantId
      );

      // Remove admin permission
      const adminResult = await this.revoke(
        userId,
        Permission.ADMIN,
        ResourceType.TENANT,
        this.currentTenantId
      );

      return memberResult && adminResult;
    } catch (error) {
      console.error('Error removing user from tenant', { error, userId });
      return false;
    }
  }

  /**
   * Update a user's role in a tenant
   * @param userId User ID
   * @param isAdmin Whether the user should be an admin
   */
  public async updateUserRole(userId: string, isAdmin: boolean): Promise<boolean> {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID not set. Call initialize() first.');
    }

    try {
      if (isAdmin) {
        // Grant admin permission
        return await this.grant(
          userId,
          Permission.ADMIN,
          ResourceType.TENANT,
          this.currentTenantId
        );
      } else {
        // Revoke admin permission
        return await this.revoke(
          userId,
          Permission.ADMIN,
          ResourceType.TENANT,
          this.currentTenantId
        );
      }
    } catch (error) {
      console.error('Error updating user role', { error, userId, isAdmin });
      return false;
    }
  }

  /**
   * Create a new tenant
   * @param tenantId Tenant ID
   * @param adminUserId Admin user ID
   */
  public async createTenant(tenantId: string, adminUserId: string): Promise<boolean> {
    try {
      const result = await this.apiClient.createTenant({
        tenantId,
        adminUserId,
      });

      return result.success;
    } catch (error) {
      console.error('Error creating tenant', { error, tenantId, adminUserId });
      return false;
    }
  }

  /**
   * Delete a tenant
   * @param tenantId Tenant ID
   */
  public async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      const result = await this.apiClient.deleteTenant(tenantId);

      // Invalidate cache for this tenant
      this.cache.invalidateTenant(tenantId);

      return result.success;
    } catch (error) {
      console.error('Error deleting tenant', { error, tenantId });
      return false;
    }
  }

  /**
   * List all tenants
   */
  public async listTenants(): Promise<string[]> {
    try {
      const result = await this.apiClient.listTenants();

      return result.tenants;
    } catch (error) {
      console.error('Error listing tenants', error);
      return [];
    }
  }


}
