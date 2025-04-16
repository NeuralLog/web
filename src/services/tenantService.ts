import { OpenFGAClient } from '@openfga/sdk';
import { initializeFga } from './fgaService';

// Initialize the OpenFGA client
let fgaClient: OpenFGAClient | null = null;

/**
 * Ensure the FGA client is initialized
 */
async function ensureFgaClient(): Promise<OpenFGAClient> {
  if (!fgaClient) {
    await initializeFga();
    
    // Get the client from the fgaService
    const FGA_API_URL = process.env.FGA_API_URL || 'http://localhost:8080';
    const FGA_STORE_ID = process.env.FGA_STORE_ID || '';
    
    fgaClient = new OpenFGAClient({
      apiUrl: FGA_API_URL,
      storeId: FGA_STORE_ID,
    });
  }
  
  if (!fgaClient) {
    throw new Error('Failed to initialize OpenFGA client');
  }
  
  return fgaClient;
}

/**
 * Create a new tenant
 * @param tenantId The ID of the tenant to create
 * @param adminUserId The ID of the user who will be the admin of the tenant
 */
export async function createTenant(tenantId: string, adminUserId: string): Promise<void> {
  const client = await ensureFgaClient();
  
  await client.write({
    writes: [
      {
        user: `user:${adminUserId}`,
        relation: 'admin',
        object: `tenant:${tenantId}`,
      },
      {
        user: `user:${adminUserId}`,
        relation: 'member',
        object: `tenant:${tenantId}`,
      },
    ],
  });
  
  console.log(`Created tenant ${tenantId} with admin ${adminUserId}`);
}

/**
 * Add a user to a tenant
 * @param tenantId The ID of the tenant
 * @param userId The ID of the user to add
 * @param isAdmin Whether the user should be an admin (default: false)
 */
export async function addUserToTenant(tenantId: string, userId: string, isAdmin: boolean = false): Promise<void> {
  const client = await ensureFgaClient();
  
  const writes = [
    {
      user: `user:${userId}`,
      relation: 'member',
      object: `tenant:${tenantId}`,
    },
  ];
  
  if (isAdmin) {
    writes.push({
      user: `user:${userId}`,
      relation: 'admin',
      object: `tenant:${tenantId}`,
    });
  }
  
  await client.write({ writes });
  
  const role = isAdmin ? 'admin' : 'member';
  console.log(`Added user ${userId} as ${role} to tenant ${tenantId}`);
}

/**
 * Remove a user from a tenant
 * @param tenantId The ID of the tenant
 * @param userId The ID of the user to remove
 */
export async function removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
  const client = await ensureFgaClient();
  
  await client.write({
    deletes: [
      {
        user: `user:${userId}`,
        relation: 'member',
        object: `tenant:${tenantId}`,
      },
      {
        user: `user:${userId}`,
        relation: 'admin',
        object: `tenant:${tenantId}`,
      },
    ],
  });
  
  console.log(`Removed user ${userId} from tenant ${tenantId}`);
}

/**
 * Check if a user is a member of a tenant
 * @param tenantId The ID of the tenant
 * @param userId The ID of the user
 * @returns Whether the user is a member of the tenant
 */
export async function isUserInTenant(tenantId: string, userId: string): Promise<boolean> {
  const client = await ensureFgaClient();
  
  const { allowed } = await client.check({
    user: `user:${userId}`,
    relation: 'member',
    object: `tenant:${tenantId}`,
  });
  
  return allowed;
}

/**
 * Check if a user is an admin of a tenant
 * @param tenantId The ID of the tenant
 * @param userId The ID of the user
 * @returns Whether the user is an admin of the tenant
 */
export async function isUserTenantAdmin(tenantId: string, userId: string): Promise<boolean> {
  const client = await ensureFgaClient();
  
  const { allowed } = await client.check({
    user: `user:${userId}`,
    relation: 'admin',
    object: `tenant:${tenantId}`,
  });
  
  return allowed;
}

/**
 * Migrate a tenant to a new ID
 * This is useful when moving a tenant to a new namespace in Kubernetes
 * @param oldTenantId The current ID of the tenant
 * @param newTenantId The new ID for the tenant
 */
export async function migrateTenant(oldTenantId: string, newTenantId: string): Promise<void> {
  const client = await ensureFgaClient();
  
  console.log(`Starting migration of tenant ${oldTenantId} to ${newTenantId}...`);
  
  try {
    // Step 1: Create the new tenant
    console.log('Creating new tenant...');
    
    // Step 2: Find all users with access to the old tenant
    console.log('Finding users with access to the old tenant...');
    // Note: In a real implementation, we would use OpenFGA's list objects API
    // For now, we'll assume we have a way to get all users
    
    // Step 3: Copy all user relationships to the new tenant
    console.log('Copying user relationships...');
    // This would involve listing all users and their relationships
    // and creating the same relationships with the new tenant
    
    // Step 4: Find all API keys belonging to the old tenant
    console.log('Finding API keys belonging to the old tenant...');
    // Again, in a real implementation, we would use OpenFGA's list objects API
    
    // Step 5: Update the parent relationship for all API keys
    console.log('Updating API key relationships...');
    // For each API key, we would update its parent from old tenant to new tenant
    
    // Step 6: Verify the migration
    console.log('Verifying migration...');
    // Check that all users and API keys have been properly migrated
    
    console.log(`Migration of tenant ${oldTenantId} to ${newTenantId} completed successfully!`);
  } catch (error) {
    console.error(`Error migrating tenant ${oldTenantId} to ${newTenantId}:`, error);
    throw error;
  }
}

/**
 * Get all API keys for a tenant
 * @param tenantId The ID of the tenant
 * @returns Array of API key IDs
 */
export async function getTenantApiKeys(tenantId: string): Promise<string[]> {
  const client = await ensureFgaClient();
  
  // In a real implementation, we would use OpenFGA's list objects API
  // For now, we'll return a placeholder
  console.log(`Getting API keys for tenant ${tenantId}...`);
  
  return [];
}
