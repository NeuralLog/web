/**
 * Mock implementation of the fgaService
 */

import { ApiKey } from '@/types/apiKey';

// Mock functions
export const mockCheck = jest.fn().mockResolvedValue({ allowed: true });
export const mockWrite = jest.fn().mockResolvedValue({});

// Mock client
const mockClient = {
  check: mockCheck,
  write: mockWrite
};

// Cache for FGA clients
const fgaClients = new Map<string, typeof mockClient>();

/**
 * Initialize the OpenFGA client
 */
export async function initializeFga(): Promise<typeof mockClient> {
  // Return the mock client
  return mockClient;
}

/**
 * Reset the mock state for tests
 */
export function resetForTests(): void {
  mockCheck.mockClear();
  mockWrite.mockClear();
  fgaClients.clear();
}

/**
 * Check if a user has access to an object
 */
export async function checkUserAccess(
  fgaClient: any,
  userId: string,
  relation: string,
  object: string
): Promise<boolean> {
  try {
    const response = await mockCheck({
      user: userId,
      relation,
      object
    });

    return response.allowed;
  } catch (error) {
    console.error(`Failed to check access for user ${userId} to ${object}:`, error);
    return false;
  }
}

/**
 * Add a relation between a user and an object
 */
export async function addUserRelation(
  fgaClient: any,
  userId: string,
  relation: string,
  object: string
): Promise<void> {
  try {
    await mockWrite({
      writes: {
        tuple_keys: [
          {
            user: userId,
            relation,
            object
          }
        ]
      }
    });
  } catch (error) {
    console.error(`Failed to add relation ${relation} for user ${userId} to ${object}:`, error);
    throw error;
  }
}

/**
 * Remove a relation between a user and an object
 */
export async function removeUserRelation(
  fgaClient: any,
  userId: string,
  relation: string,
  object: string
): Promise<void> {
  try {
    await mockWrite({
      deletes: {
        tuple_keys: [
          {
            user: userId,
            relation,
            object
          }
        ]
      }
    });
  } catch (error) {
    console.error(`Failed to remove relation ${relation} for user ${userId} from ${object}:`, error);
    throw error;
  }
}

/**
 * Register an API key with OpenFGA
 */
export async function registerApiKey(apiKey: ApiKey, userId: string): Promise<void> {
  // Mock implementation
  return Promise.resolve();
}

/**
 * Generate a proof for an API key
 */
export async function generateApiKeyProof(apiKey: string, userId: string): Promise<string> {
  return 'mock-proof';
}
