/**
 * Auth Service API Client
 */

import {
  AuthCheckRequest,
  AuthCheckResponse,
  AuthTupleRequest,
  AuthTupleResponse,
  TenantCreateRequest,
  TenantCreateResponse,
  TenantListResponse
} from './types';

/**
 * Auth service API client options
 */
export interface AuthApiClientOptions {
  /**
   * Auth service API URL
   */
  apiUrl: string;
  
  /**
   * API key for auth service
   */
  apiKey?: string;
  
  /**
   * Tenant ID
   */
  tenantId: string;
}

/**
 * Auth service API client
 */
export class AuthApiClient {
  private apiUrl: string;
  private apiKey?: string;
  private tenantId: string;
  
  constructor(options: AuthApiClientOptions) {
    this.apiUrl = options.apiUrl;
    this.apiKey = options.apiKey;
    this.tenantId = options.tenantId;
  }
  
  /**
   * Set the tenant ID
   */
  public setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }
  
  /**
   * Set the API URL
   */
  public setApiUrl(apiUrl: string): void {
    this.apiUrl = apiUrl;
  }
  
  /**
   * Make an API request to the auth service
   */
  private async apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.apiUrl}/api${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.tenantId,
    };
    
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Auth service request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Check if a user has permission to access a resource
   */
  public async check(request: AuthCheckRequest): Promise<AuthCheckResponse> {
    return this.apiRequest<AuthCheckResponse>('/auth/check', 'POST', request);
  }
  
  /**
   * Grant a permission to a user
   */
  public async grant(request: AuthTupleRequest): Promise<AuthTupleResponse> {
    return this.apiRequest<AuthTupleResponse>('/auth/grant', 'POST', request);
  }
  
  /**
   * Revoke a permission from a user
   */
  public async revoke(request: AuthTupleRequest): Promise<AuthTupleResponse> {
    return this.apiRequest<AuthTupleResponse>('/auth/revoke', 'POST', request);
  }
  
  /**
   * Create a new tenant
   */
  public async createTenant(request: TenantCreateRequest): Promise<TenantCreateResponse> {
    return this.apiRequest<TenantCreateResponse>('/tenants/create', 'POST', request);
  }
  
  /**
   * Delete a tenant
   */
  public async deleteTenant(tenantId: string): Promise<AuthTupleResponse> {
    return this.apiRequest<AuthTupleResponse>(`/tenants/${tenantId}`, 'DELETE');
  }
  
  /**
   * List all tenants
   */
  public async listTenants(): Promise<TenantListResponse> {
    return this.apiRequest<TenantListResponse>('/tenants');
  }
}
