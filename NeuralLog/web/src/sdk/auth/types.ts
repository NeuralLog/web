/**
 * Auth SDK Types
 */

/**
 * Permission enum
 */
export enum Permission {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  MEMBER = 'member'
}

/**
 * Resource type enum
 */
export enum ResourceType {
  LOG = 'log',
  TENANT = 'tenant',
  ORGANIZATION = 'organization',
  API_KEY = 'api_key',
  DASHBOARD = 'dashboard',
  ALERT = 'alert',
  AGENT = 'agent'
}

/**
 * Auth client options
 */
export interface AuthClientOptions {
  /**
   * Auth service API URL
   * @default http://localhost:3040
   */
  apiUrl?: string;

  /**
   * API key for auth service
   */
  apiKey?: string;

  /**
   * Cache TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  cacheTtl?: number;
}

/**
 * Auth check request
 */
export interface AuthCheckRequest {
  user: string;
  relation: string;
  object: string;
  contextualTuples?: Array<{
    user: string;
    relation: string;
    object: string;
  }>;
}

/**
 * Auth check response
 */
export interface AuthCheckResponse {
  allowed: boolean;
}

/**
 * Auth grant/revoke request
 */
export interface AuthTupleRequest {
  user: string;
  relation: string;
  object: string;
}

/**
 * Auth grant/revoke response
 */
export interface AuthTupleResponse {
  success: boolean;
}

/**
 * Tenant create request
 */
export interface TenantCreateRequest {
  tenantId: string;
  adminUserId: string;
}

/**
 * Tenant create response
 */
export interface TenantCreateResponse {
  success: boolean;
}

/**
 * Tenant list response
 */
export interface TenantListResponse {
  tenants: string[];
}
