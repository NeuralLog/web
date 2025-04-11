import { ApiKey } from '@/types/apiKey';
import { ApiKeyStorage } from '@/types/apiKeyStorage';
import { getTenantId } from './tenantContext';
import { jwtDecode } from 'jwt-decode';
import { getToken } from './tokenService';

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

  /**
   * Get the user ID from the Auth0 token
   * @returns The user ID or null if not authenticated
   */
  private async getUserIdFromToken(): Promise<string | null> {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token found');
        return null;
      }

      const decoded = jwtDecode<{ sub: string }>(token);
      return decoded.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
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

      // Get the user ID from the Auth0 token
      const userId = await this.getUserIdFromToken();

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get the token
      const token = await getToken();

      if (!token) {
        throw new Error('No auth token found');
      }

      // Call the auth service to get API keys
      const response = await fetch(`${this.authServiceUrl}/api/apikeys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId || 'default',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Provide more specific error messages based on status code
        if (response.status === 401) {
          throw new Error('Authentication failed: Your session may have expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied: You do not have permission to view these API keys.');
        } else if (response.status === 404) {
          throw new Error('No API keys found for this user.');
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to get API keys: ${response.status} ${response.statusText}\nDetails: ${errorText}`);
        }
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
      // Log the error with more context
      console.error('Error getting API keys:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        tenantId: await getTenantId()
      });

      // Rethrow with a more user-friendly message
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve API keys: ${error.message}`);
      } else {
        throw new Error('Failed to retrieve API keys due to an unknown error');
      }
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

      // Get the token
      const token = await getToken();

      if (!token) {
        throw new Error('No auth token found');
      }

      // Call the auth service to create an API key
      const response = await fetch(`${this.authServiceUrl}/api/apikeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId || 'default',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          scopes
        })
      });

      if (!response.ok) {
        // Provide more specific error messages based on status code
        if (response.status === 401) {
          throw new Error('Authentication failed: Your session may have expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied: You do not have permission to create API keys.');
        } else if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Invalid request: ${errorData.message || 'Please check your input and try again.'}`);
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to create API key: ${response.status} ${response.statusText}\nDetails: ${errorText}`);
        }
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

      // Get the token
      const token = await getToken();

      if (!token) {
        throw new Error('No auth token found');
      }

      // Call the auth service to revoke an API key
      const response = await fetch(`${this.authServiceUrl}/api/apikeys/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId || 'default',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Provide more specific error messages based on status code
        if (response.status === 401) {
          throw new Error('Authentication failed: Your session may have expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied: You do not have permission to revoke this API key.');
        } else if (response.status === 404) {
          throw new Error('API key not found: The key may have already been revoked or does not exist.');
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to revoke API key: ${response.status} ${response.statusText}\nDetails: ${errorText}`);
        }
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
