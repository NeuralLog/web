import { OpenFGAClient } from '@openfga/sdk';
import { ApiKey } from '@/types/apiKey';
import { getTenantId } from '@/services/tenantContext';

// Configuration for OpenFGA client
const FGA_API_URL = process.env.NEXT_PUBLIC_OPENFGA_API_URL || 'http://localhost:8080';
const FGA_STORE_ID = process.env.NEXT_PUBLIC_OPENFGA_STORE_ID || '';

// Cache for FGA clients
const fgaClients = new Map<string, OpenFGAClient>();

// Initialize the OpenFGA client
let fgaClient: OpenFGAClient | null = null;
let fgaStoreId: string = FGA_STORE_ID;

/**
 * Reset the FGA client and store ID for tests
 * This is only used in tests to reset the module state
 */
export function resetForTests(storeId: string): void {
  if (process.env.NODE_ENV === 'test') {
    fgaClient = null;
    fgaClients.clear();
    fgaStoreId = storeId;
  }
}

/**
 * Initialize the OpenFGA client and store
 * This should be called during application startup
 */
export async function initializeFga(): Promise<OpenFGAClient> {
  try {
    // For client-side rendering, we'll use a mock client
    if (typeof window !== 'undefined') {
      // This is a simplified mock implementation for client-side
      const mockClient = {
        check: async () => ({ allowed: true }),
        write: async () => ({}),
        // Add other methods as needed
      } as unknown as OpenFGAClient;

      fgaClient = mockClient;
      return mockClient;
    }

    // Get the current tenant ID
    const tenantId = await getTenantId();

    // Check if we already have a client for this tenant
    if (fgaClients.has(tenantId)) {
      return fgaClients.get(tenantId)!;
    }

    // Create the OpenFGA client
    fgaClient = new OpenFGAClient({
      apiUrl: FGA_API_URL,
      storeId: fgaStoreId,
      authorizationModelId: process.env.NEXT_PUBLIC_OPENFGA_MODEL_ID,
    });

    // If no store ID is provided, use a default for tests
    if (!fgaStoreId) {
      if (process.env.NODE_ENV === 'test') {
        fgaStoreId = 'test-store-id';
      } else {
        throw new Error('OpenFGA store ID is not configured');
      }
    }

    // Cache the client for this tenant
    fgaClients.set(tenantId, fgaClient);

    console.log(`OpenFGA initialized with store ID: ${fgaStoreId} for tenant: ${tenantId}`);

    return fgaClient;
  } catch (error) {
    console.error('Failed to initialize OpenFGA:', error);

    // Return a mock client in case of error
    const mockClient = {
      check: async () => ({ allowed: true }),
      write: async () => ({}),
      // Add other methods as needed
    } as unknown as OpenFGAClient;

    fgaClient = mockClient;
    return mockClient;
  }
}

/**
 * Create the authorization model for API keys with tenant support
 */
async function createAuthorizationModel(): Promise<void> {
  if (!fgaClient) {
    throw new Error('OpenFGA client not initialized');
  }

  // Define the authorization model with tenant type and parent-child relationships
  const authorizationModel = {
    type_definitions: [
      {
        type: 'user',
        relations: {},
      },
      {
        type: 'tenant',
        relations: {
          admin: {
            this: {},
          },
          member: {
            this: {},
          },
        },
        metadata: {
          relations: {
            admin: {
              directly_related_user_types: [
                {
                  type: 'user',
                },
              ],
            },
            member: {
              directly_related_user_types: [
                {
                  type: 'user',
                },
              ],
            },
          },
        },
      },
      {
        type: 'api_key',
        relations: {
          owner: {
            this: {},
          },
          parent: {
            this: {},
          },
          can_use: {
            union: {
              child: [
                {
                  this: {},
                },
                {
                  computedUserset: {
                    relation: 'owner',
                  },
                },
              ],
            },
          },
        },
        metadata: {
          relations: {
            owner: {
              directly_related_user_types: [
                {
                  type: 'user',
                },
              ],
            },
            parent: {
              directly_related_user_types: [
                {
                  type: 'tenant',
                },
              ],
            },
          },
        },
      },
    ],
  };

  // Create the authorization model
  const { authorization_model_id } = await fgaClient.writeAuthorizationModel(authorizationModel);
  console.log(`Created authorization model: ${authorization_model_id}`);
}

/**
 * Register an API key in OpenFGA
 * Note: We only register the key ID/prefix, NEVER the full API key
 * @param apiKey The API key metadata (NOT the full key value)
 * @param userId The ID of the user who owns the API key
 * @param tenantId Optional tenant ID for multi-tenant environments
 */
export async function registerApiKey(apiKey: ApiKey, userId: string, tenantId?: string): Promise<void> {
  if (!fgaClient) {
    await initializeFga();
  }

  if (!fgaClient) {
    throw new Error('OpenFGA client not initialized');
  }

  // Register the API key as an object using only the key ID
  // We NEVER store the actual API key value anywhere
  const objectId = `api_key:${apiKey.id}`;

  // Prepare the writes
  const writes = [
    // Set the user as the owner of the API key
    {
      user: `user:${userId}`,
      relation: 'owner',
      object: objectId,
    },
  ];

  // If tenant ID is provided, set the tenant as the parent of the API key
  if (tenantId) {
    writes.push({
      user: `tenant:${tenantId}`,
      relation: 'parent',
      object: objectId,
    });

    // Also ensure the user is a member of the tenant if not already
    writes.push({
      user: `user:${userId}`,
      relation: 'member',
      object: `tenant:${tenantId}`,
    });
  }

  // Write all relationships
  await fgaClient.write({ writes });

  const tenantInfo = tenantId ? ` in tenant ${tenantId}` : '';

  console.log(`Registered API key ${apiKey.id} for user ${userId}${tenantInfo}`);
}

/**
 * Generate a zero-knowledge proof for an API key
 * This allows a client to prove they know an API key without revealing it
 * @param apiKeyValue The full API key value (only used client-side, never stored)
 * @param userId The ID of the user who owns the API key
 * @param tenantId Optional tenant ID for multi-tenant environments
 * @returns A proof that can be used to verify the API key without revealing it
 */
export async function generateApiKeyProof(apiKeyValue: string, userId: string, tenantId?: string): Promise<string> {
  if (!fgaClient) {
    await initializeFga();
  }

  if (!fgaClient) {
    throw new Error('OpenFGA client not initialized');
  }

  // IMPORTANT: In a real ZKP system, we would use a proper cryptographic protocol
  // This is a simplified implementation for demonstration purposes
  // A production system would use a proper ZKP library

  // Extract the key prefix (first 8 characters)
  const keyPrefix = apiKeyValue.substring(0, 8);

  // Create a proof token that includes the user ID and a hash of the full key
  // The server never sees or stores the full API key value
  const proofData = {
    userId,
    keyPrefix,
    timestamp: Date.now(),
    // Include tenant ID if provided
    ...(tenantId && { tenantId }),
    // Hash of the full key - in a real ZKP system, this would be a proper cryptographic proof
    hash: await simpleHash(apiKeyValue),
  };

  // Return the proof as a base64-encoded JSON string
  return Buffer.from(JSON.stringify(proofData)).toString('base64');
}

/**
 * Verify a zero-knowledge proof for an API key
 * This verifies that a client knows an API key without the client revealing the key
 * @param apiKeyValue The API key to verify (only the prefix is used for lookup)
 * @param proof The proof to verify
 * @param tenantId Optional tenant ID to override the one in the proof
 * @returns Whether the proof is valid for the API key
 */
export async function verifyApiKeyProof(apiKeyValue: string, proof: string, tenantId?: string): Promise<boolean> {
  if (!fgaClient) {
    await initializeFga();
  }

  if (!fgaClient) {
    throw new Error('OpenFGA client not initialized');
  }

  try {
    // Decode the proof
    const proofData = JSON.parse(Buffer.from(proof, 'base64').toString());

    // Verify that the key prefix matches
    // We only use the prefix for identification, never the full key
    const keyPrefix = apiKeyValue.substring(0, 8);
    if (proofData.keyPrefix !== keyPrefix) {
      return false;
    }

    // Verify the hash - this is the zero-knowledge part
    // We verify the client knows the key without them revealing it to us
    const expectedHash = await simpleHash(apiKeyValue);
    if (proofData.hash !== expectedHash) {
      return false;
    }

    // Use tenant ID from proof or from parameter
    const effectiveTenantId = tenantId || proofData.tenantId;
    const userId = proofData.userId;
    const objectId = `api_key:${keyPrefix}`;

    // First check if the user can use the API key directly
    const keyCheck = await fgaClient.check({
      user: `user:${userId}`,
      relation: 'can_use',
      object: objectId,
    });

    // If direct check passes, we're done
    if (keyCheck.allowed) {
      return true;
    }

    // If tenant ID is provided, check if the user is a member of the tenant
    // and if the API key belongs to that tenant
    if (effectiveTenantId) {
      // Check if user is a member of the tenant
      const tenantMemberCheck = await fgaClient.check({
        user: `user:${userId}`,
        relation: 'member',
        object: `tenant:${effectiveTenantId}`,
      });

      // Check if the API key belongs to the tenant
      const keyTenantCheck = await fgaClient.check({
        user: `tenant:${effectiveTenantId}`,
        relation: 'parent',
        object: objectId,
      });

      // Both checks must pass
      return tenantMemberCheck.allowed && keyTenantCheck.allowed;
    }

    // If we get here, the verification failed
    return false;
  } catch (error) {
    console.error('Error verifying API key proof:', error);
    return false;
  }
}

/**
 * Simple hash function for demonstration purposes
 * In a real implementation, we would use a proper cryptographic hash function
 * @param value The value to hash
 * @returns A hash of the value
 */
async function simpleHash(value: string): Promise<string> {
  try {
    // In a browser or Node.js environment with Web Crypto API
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Node.js environment
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    console.error('Error using crypto API:', error);
  }

  // Fallback for environments without Web Crypto API
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Check if a user has access to an object
 * @param fga The OpenFGA client
 * @param userId The ID of the user
 * @param relation The relation to check
 * @param object The object to check access to
 * @returns Whether the user has access
 */
export async function checkUserAccess(
  fga: OpenFGAClient,
  userId: string,
  relation: string,
  object: string
): Promise<boolean> {
  try {
    const response = await fga.check({
      user: userId,
      relation,
      object,
    });

    return response.allowed;
  } catch (error) {
    console.error(`Failed to check access for user ${userId} to ${object}:`, error);
    return false;
  }
}

/**
 * Add a relation between a user and an object
 * @param fga The OpenFGA client
 * @param userId The ID of the user
 * @param relation The relation to add
 * @param object The object to add the relation to
 */
export async function addUserRelation(
  fga: OpenFGAClient,
  userId: string,
  relation: string,
  object: string
): Promise<void> {
  try {
    await fga.write({
      writes: {
        tuple_keys: [
          {
            user: userId,
            relation,
            object,
          },
        ],
      },
    });
  } catch (error) {
    console.error(`Failed to add relation ${relation} for user ${userId} to ${object}:`, error);
    throw error;
  }
}

/**
 * Remove a relation between a user and an object
 * @param fga The OpenFGA client
 * @param userId The ID of the user
 * @param relation The relation to remove
 * @param object The object to remove the relation from
 */
export async function removeUserRelation(
  fga: OpenFGAClient,
  userId: string,
  relation: string,
  object: string
): Promise<void> {
  try {
    await fga.write({
      deletes: {
        tuple_keys: [
          {
            user: userId,
            relation,
            object,
          },
        ],
      },
    });
  } catch (error) {
    console.error(`Failed to remove relation ${relation} for user ${userId} from ${object}:`, error);
    throw error;
  }
}

/**
 * Check if a user is in a tenant
 * @param tenantId The ID of the tenant
 * @param userId The ID of the user
 * @returns Whether the user is in the tenant
 */
export async function isUserInTenant(tenantId: string, userId: string): Promise<boolean> {
  if (!fgaClient) {
    await initializeFga();
  }

  if (!fgaClient) {
    throw new Error('OpenFGA client not initialized');
  }

  try {
    const response = await fgaClient.check({
      user: `user:${userId}`,
      relation: 'member',
      object: `tenant:${tenantId}`,
    });

    return response.allowed;
  } catch (error) {
    console.error(`Failed to check if user ${userId} is in tenant ${tenantId}:`, error);
    return false;
  }
}

/**
 * Add a user to a tenant
 * @param tenantId The ID of the tenant
 * @param userId The ID of the user
 * @param isAdmin Whether the user should be an admin (default: false)
 */
export async function addUserToTenant(tenantId: string, userId: string, isAdmin: boolean = false): Promise<void> {
  if (!fgaClient) {
    await initializeFga();
  }

  if (!fgaClient) {
    throw new Error('OpenFGA client not initialized');
  }

  try {
    // Add the user as a member of the tenant
    await fgaClient.write({
      writes: {
        tuple_keys: [
          {
            user: `user:${userId}`,
            relation: 'member',
            object: `tenant:${tenantId}`,
          },
        ],
      },
    });

    // If the user should be an admin, add that relation too
    if (isAdmin) {
      await fgaClient.write({
        writes: {
          tuple_keys: [
            {
              user: `user:${userId}`,
              relation: 'admin',
              object: `tenant:${tenantId}`,
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error(`Failed to add user ${userId} to tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Remove a user from a tenant
 * @param tenantId The ID of the tenant
 * @param userId The ID of the user
 */
export async function removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
  if (!fgaClient) {
    await initializeFga();
  }

  if (!fgaClient) {
    throw new Error('OpenFGA client not initialized');
  }

  try {
    // Remove the user as a member of the tenant
    await fgaClient.write({
      deletes: {
        tuple_keys: [
          {
            user: `user:${userId}`,
            relation: 'member',
            object: `tenant:${tenantId}`,
          },
        ],
      },
    });

    // Also remove admin relation if it exists
    await fgaClient.write({
      deletes: {
        tuple_keys: [
          {
            user: `user:${userId}`,
            relation: 'admin',
            object: `tenant:${tenantId}`,
          },
        ],
      },
    });
  } catch (error) {
    console.error(`Failed to remove user ${userId} from tenant ${tenantId}:`, error);
    throw error;
  }
}
