/**
 * NeuralLog Auth Client
 * 
 * This client provides authentication and authorization functionality
 * for the NeuralLog web application. It uses OpenFGA for authorization
 * and respects the tenant context from the tenant service.
 */

import { OpenFgaClient } from '@openfga/sdk';
import { getTenantId, getTenantIdSync } from '@/services/tenantContext';

// Cache for authorization checks
const authCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export enum Permission {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum ResourceType {
  LOG = 'log',
  TENANT = 'tenant',
  ORGANIZATION = 'organization',
  API_KEY = 'api_key',
  DASHBOARD = 'dashboard',
  ALERT = 'alert',
  AGENT = 'agent'
}

export interface AuthClientOptions {
  /**
   * OpenFGA API URL
   * @default http://localhost:8080 in development, tenant-specific URL in production
   */
  apiUrl?: string;
  
  /**
   * Store ID for OpenFGA
   */
  storeId?: string;
  
  /**
   * Authorization model ID for OpenFGA
   */
  authorizationModelId?: string;
  
  /**
   * Whether to use tenant-specific OpenFGA instances
   * @default true in production, false in development
   */
  useTenantSpecificInstances?: boolean;
  
  /**
   * Tenant namespace format for Kubernetes
   * @default tenant-{tenantId}
   */
  tenantNamespaceFormat?: string;
  
  /**
   * OpenFGA service name in tenant namespace
   * @default openfga
   */
  openfgaServiceName?: string;
  
  /**
   * OpenFGA service port in tenant namespace
   * @default 8080
   */
  openfgaServicePort?: number;
}

export class AuthClient {
  private client: OpenFgaClient | null = null;
  private storeId: string;
  private authorizationModelId: string;
  private useTenantSpecificInstances: boolean;
  private tenantNamespaceFormat: string;
  private openfgaServiceName: string;
  private openfgaServicePort: number;
  private defaultApiUrl: string;
  private currentTenantId: string | null = null;
  
  constructor(options: AuthClientOptions = {}) {
    this.storeId = options.storeId || process.env.OPENFGA_STORE_ID || '';
    this.authorizationModelId = options.authorizationModelId || process.env.OPENFGA_MODEL_ID || '';
    
    // Determine if we should use tenant-specific instances
    this.useTenantSpecificInstances = options.useTenantSpecificInstances !== undefined
      ? options.useTenantSpecificInstances
      : process.env.NODE_ENV === 'production' && process.env.USE_TENANT_SPECIFIC_INSTANCES !== 'false';
    
    // Set Kubernetes-specific options
    this.tenantNamespaceFormat = options.tenantNamespaceFormat || process.env.TENANT_NAMESPACE_FORMAT || 'tenant-{tenantId}';
    this.openfgaServiceName = options.openfgaServiceName || process.env.OPENFGA_SERVICE_NAME || 'openfga';
    this.openfgaServicePort = options.openfgaServicePort || (process.env.OPENFGA_SERVICE_PORT ? parseInt(process.env.OPENFGA_SERVICE_PORT) : 8080);
    
    // Set default API URL
    this.defaultApiUrl = options.apiUrl || process.env.OPENFGA_API_URL || `http://${process.env.OPENFGA_HOST || 'localhost'}:${process.env.OPENFGA_PORT || '8080'}`;
    
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
    if (!this.storeId) {
      throw new Error('Store ID is required. Set it in the constructor options or OPENFGA_STORE_ID environment variable.');
    }
    
    if (!this.authorizationModelId) {
      throw new Error('Authorization model ID is required. Set it in the constructor options or OPENFGA_MODEL_ID environment variable.');
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
    
    // Update the client with the new tenant-specific URL if needed
    if (this.useTenantSpecificInstances) {
      const apiUrl = this.getTenantSpecificApiUrl(tenantId);
      this.client = new OpenFgaClient({
        apiUrl,
        storeId: this.storeId,
      });
      console.log(`Using tenant-specific OpenFGA instance at ${apiUrl}`);
    } else {
      this.client = new OpenFgaClient({
        apiUrl: this.defaultApiUrl,
        storeId: this.storeId,
      });
      console.log(`Using shared OpenFGA instance at ${this.defaultApiUrl}`);
    }
  }
  
  /**
   * Get the OpenFGA client
   */
  private getClient(): OpenFgaClient {
    if (!this.client) {
      throw new Error('Auth client not initialized. Call initialize() first.');
    }
    return this.client;
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
    const cacheKey = `${userId}:${permission}:${resourceType}:${resourceId}:${this.currentTenantId}`;
    
    // Check cache first
    const cachedResult = authCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
      return cachedResult.result;
    }
    
    try {
      // Add tenant context to contextual tuples
      const tuples = [
        {
          user: userId,
          relation: 'member',
          object: `tenant:${this.currentTenantId}`,
        },
      ];
      
      // Check permission
      const result = await this.getClient().check({
        store_id: this.storeId,
        authorization_model_id: this.authorizationModelId,
        tuple_key: {
          user: userId,
          relation: permission,
          object: `${resourceType}:${resourceId}`,
        },
        contextual_tuples: {
          tuple_keys: tuples,
        },
      });
      
      // Cache the result
      authCache.set(cacheKey, { result: result.allowed, timestamp: Date.now() });
      
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
      // Write tuple
      await this.getClient().write({
        store_id: this.storeId,
        writes: {
          tuple_keys: [
            {
              user: userId,
              relation: permission,
              object: `${resourceType}:${resourceId}`,
            },
          ],
        },
      });
      
      // Invalidate cache
      this.invalidateCache(userId, permission, resourceType, resourceId);
      
      return true;
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
      // Delete tuple
      await this.getClient().write({
        store_id: this.storeId,
        deletes: {
          tuple_keys: [
            {
              user: userId,
              relation: permission,
              object: `${resourceType}:${resourceId}`,
            },
          ],
        },
      });
      
      // Invalidate cache
      this.invalidateCache(userId, permission, resourceType, resourceId);
      
      return true;
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
   * Invalidate cache for a specific permission check
   */
  private invalidateCache(
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ): void {
    const cacheKey = `${userId}:${permission}:${resourceType}:${resourceId}:${this.currentTenantId}`;
    authCache.delete(cacheKey);
  }
  
  /**
   * Get the tenant-specific API URL
   */
  private getTenantSpecificApiUrl(tenantId: string): string {
    const namespace = this.tenantNamespaceFormat.replace('{tenantId}', tenantId);
    return `http://${this.openfgaServiceName}.${namespace}.svc.cluster.local:${this.openfgaServicePort}`;
  }
}
