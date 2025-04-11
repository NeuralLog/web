import { ApiKey } from './apiKey';

/**
 * Interface for API key storage providers
 */
export interface ApiKeyStorage {
  /**
   * Connect to the storage provider
   */
  connect(): Promise<void>;
  
  /**
   * Disconnect from the storage provider
   */
  disconnect(): Promise<void>;
  
  /**
   * Get all API keys
   */
  getApiKeys(): Promise<ApiKey[]>;
  
  /**
   * Save API keys
   * @param keys API keys to save
   */
  saveApiKeys(keys: ApiKey[]): Promise<void>;
  
  /**
   * Create a new API key
   * @param name Name of the API key
   * @param scopes Scopes for the API key
   */
  createApiKey(name: string, scopes: string[]): Promise<{ apiKey: string; keyData: ApiKey }>;
  
  /**
   * Revoke an API key
   * @param id ID of the API key to revoke
   */
  revokeApiKey(id: string): Promise<void>;
  
  /**
   * Update the last used timestamp for an API key
   * @param id ID of the API key
   */
  updateApiKeyLastUsed(id: string): Promise<void>;
}
