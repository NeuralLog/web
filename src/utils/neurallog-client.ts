/**
 * NeuralLog client utility for the web application
 *
 * This utility provides a singleton instance of the NeuralLogClient for use throughout the web application.
 */

import { NeuralLogClient } from '@neurallog/client-sdk';

// Configuration
const config = {
  authUrl: process.env.NEXT_PUBLIC_AUTH_URL,
  logsUrl: process.env.NEXT_PUBLIC_LOGS_URL,
  registryUrl: process.env.NEXT_PUBLIC_REGISTRY_URL || 'http://localhost:3031'
};

// Create a singleton instance of the NeuralLogClient
let clientInstance: NeuralLogClient | null = null;

/**
 * Get the NeuralLogClient instance
 *
 * @param tenantId Tenant ID (optional, will use the current tenant if not provided)
 * @returns NeuralLogClient instance
 */
export function getNeuralLogClient(tenantId?: string): NeuralLogClient {
  const currentTenantId = tenantId || getCurrentTenantId();

  if (!clientInstance) {
    // Initialize the client with the current tenant
    clientInstance = new NeuralLogClient({
      tenantId: currentTenantId,
      registryUrl: config.registryUrl,
      // Fallback to direct URLs if provided
      authUrl: config.authUrl,
      logsUrl: config.logsUrl
    });
  } else if (tenantId && clientInstance.tenantId !== tenantId) {
    // If the tenant ID has changed, create a new client
    clientInstance = new NeuralLogClient({
      tenantId: currentTenantId,
      registryUrl: config.registryUrl,
      // Fallback to direct URLs if provided
      authUrl: config.authUrl,
      logsUrl: config.logsUrl
    });
  }

  return clientInstance;
}

/**
 * Get the current tenant ID from local storage or cookies
 *
 * @returns Current tenant ID
 */
function getCurrentTenantId(): string {
  // Try to get the tenant ID from local storage
  if (typeof window !== 'undefined') {
    const storedTenantId = localStorage.getItem('neurallog_tenant_id');

    if (storedTenantId) {
      return storedTenantId;
    }
  }

  // Default tenant ID
  return 'default';
}

/**
 * Set the current tenant ID
 *
 * @param tenantId Tenant ID
 */
export function setCurrentTenantId(tenantId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('neurallog_tenant_id', tenantId);
  }

  // Reset the client instance to use the new tenant ID
  clientInstance = null;
}

/**
 * Initialize the NeuralLogClient with an API key
 *
 * @param apiKey API key
 * @returns Whether authentication was successful
 */
export async function initializeWithApiKey(apiKey: string): Promise<boolean> {
  const client = getNeuralLogClient();

  try {
    // Initialize the client to fetch endpoints from the registry
    try {
      await client.initialize();
    } catch (error) {
      console.warn('Failed to initialize client with registry:', error);
      // Continue anyway, as we might have fallback URLs
    }

    const success = await client.authenticateWithApiKey(apiKey);

    if (success) {
      // Store the API key for future use
      if (typeof window !== 'undefined') {
        localStorage.setItem('neurallog_api_key', apiKey);
      }
    }

    return success;
  } catch (error) {
    console.error('Error initializing with API key:', error);
    return false;
  }
}

/**
 * Initialize the NeuralLogClient with username and password
 *
 * @param username Username
 * @param password Password
 * @returns Whether authentication was successful
 */
export async function initializeWithCredentials(username: string, password: string): Promise<boolean> {
  const client = getNeuralLogClient();

  try {
    // Initialize the client to fetch endpoints from the registry
    try {
      await client.initialize();
    } catch (error) {
      console.warn('Failed to initialize client with registry:', error);
      // Continue anyway, as we might have fallback URLs
    }

    const success = await client.login(username, password);
    return success;
  } catch (error) {
    console.error('Error initializing with credentials:', error);
    return false;
  }
}

/**
 * Check if the NeuralLogClient is authenticated
 *
 * @returns Whether the client is authenticated
 */
export function isAuthenticated(): boolean {
  const client = getNeuralLogClient();
  return client.isAuthenticated;
}

/**
 * Log out
 */
export async function logout(): Promise<void> {
  const client = getNeuralLogClient();

  try {
    await client.logout();

    // Clear stored API key
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neurallog_api_key');
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

/**
 * Try to initialize the NeuralLogClient with a stored API key
 *
 * @returns Whether initialization was successful
 */
export async function tryInitializeWithStoredApiKey(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  const storedApiKey = localStorage.getItem('neurallog_api_key');

  if (!storedApiKey) {
    return false;
  }

  // Get the client and ensure it's initialized with the registry
  const client = getNeuralLogClient();

  // Initialize the client to fetch endpoints from the registry
  try {
    await client.initialize();
  } catch (error) {
    console.warn('Failed to initialize client with registry:', error);
    // Continue anyway, as we might have fallback URLs
  }

  return initializeWithApiKey(storedApiKey);
}
