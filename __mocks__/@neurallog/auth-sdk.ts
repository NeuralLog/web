/**
 * Mock for the @neurallog/auth-sdk package
 */

export enum TenantRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export class AuthClient {
  private tenantId: string;
  
  constructor(options: { authServiceUrl: string, tenantId: string, token?: string, cacheTtl?: number }) {
    this.tenantId = options.tenantId;
  }
  
  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }
  
  async check(params: { user: string, permission: string, resource: string }): Promise<boolean> {
    return true;
  }
  
  async grant(params: { user: string, permission: string, resource: string }): Promise<boolean> {
    return true;
  }
  
  async revoke(params: { user: string, permission: string, resource: string }): Promise<boolean> {
    return true;
  }
}
