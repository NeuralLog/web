import { ApiKey } from '@/types/apiKey';
import { ApiKeyStorage } from '@/types/apiKeyStorage';
import { getTenantId } from './tenantContext';

/**
 * Auth Service API Key Storage
 * 
 * This implementation uses the auth service to store and manage API keys.
 */
export class AuthApiKeyStorage implements ApiKeyStorage {
  private authServiceUrl: string;
  
  constructor() {
    this.authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3040';
  }

  async connect(): Promise<void> {
    // No connection needed
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    // No disconnection needed
    return Promise.resolve();
  }

  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const tenantId = await getTenantId();
      
      // Get the user ID from the session
      // This would typically come from your authentication system
      const userId = 'current-user-id'; // Replace with actual user ID from session
      
      // Call the auth service to get API keys
      const response = await fetch(`${this.authServiceUrl}/api/apikeys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId || 'default',
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token') // Replace with your actual auth token
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get API keys: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert the API keys to the expected format
      return data.apiKeys.map((key: any) => ({
        id: key.id,
        name: key.name,
        keyPrefix: key.id.substring(0, 8),
        scopes: key.scopes,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt || null
      }));
    } catch (error) {
      console.error('Error getting API keys:', error);
      return [];
    }
  }

  async saveApiKeys(keys: ApiKey[]): Promise<void> {
    // This method is not needed as the auth service manages API keys
    console.warn('saveApiKeys is not implemented as the auth service manages API keys');
    return Promise.resolve();
  }

  async createApiKey(name: string, scopes: string[]): Promise<{ apiKey: string; keyData: ApiKey }> {
    try {
      const tenantId = await getTenantId();
      
      // Call the auth service to create an API key
      const response = await fetch(`${this.authServiceUrl}/api/apikeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId || 'default',
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token') // Replace with your actual auth token
        },
        body: JSON.stringify({
          name,
          scopes
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create API key: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert the API key to the expected format
      const keyData: ApiKey = {
        id: data.id,
        name: data.name,
        keyPrefix: data.apiKey.substring(0, 8),
        scopes: data.scopes,
        createdAt: data.createdAt,
        lastUsedAt: null
      };
      
      return {
        apiKey: data.apiKey,
        keyData
      };
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  async revokeApiKey(id: string): Promise<void> {
    try {
      const tenantId = await getTenantId();
      
      // Call the auth service to revoke an API key
      const response = await fetch(`${this.authServiceUrl}/api/apikeys/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId || 'default',
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token') // Replace with your actual auth token
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to revoke API key: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    // This method is not needed as the auth service tracks last used automatically
    console.warn('updateApiKeyLastUsed is not implemented as the auth service tracks this automatically');
    return Promise.resolve();
  }
}
