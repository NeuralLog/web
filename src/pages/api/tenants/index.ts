import { NextApiRequest, NextApiResponse } from 'next';
import { withTenant, withAuth, withTenantAdmin } from '@/middleware/apiMiddleware';
import { createTenant, isUserTenantAdmin } from '@/services/tenantService';
import { getCurrentUser } from '@/services/userService';

/**
 * API handler for tenant operations
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const tenantId = (req as any).tenantId;
  
  switch (method) {
    case 'GET':
      // List tenants the user has access to
      return handleGetTenants(req, res);
    case 'POST':
      // Create a new tenant
      return handleCreateTenant(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

/**
 * Handle GET request to list tenants
 */
async function handleGetTenants(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real implementation, we would query the database or auth service
    // to get all tenants the user has access to
    // For now, we'll return a placeholder
    
    return res.status(200).json({
      tenants: [
        {
          id: (req as any).tenantId,
          name: 'Current Tenant',
          isAdmin: await isUserTenantAdmin((req as any).tenantId, user.id)
        }
      ]
    });
  } catch (error) {
    console.error('Error listing tenants:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle POST request to create a tenant
 */
async function handleCreateTenant(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, id } = req.body;
    
    if (!name || !id) {
      return res.status(400).json({ error: 'Name and ID are required' });
    }
    
    // Get the current user
    const user = await getCurrentUser();
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Create the tenant
    await createTenant(id, user.id);
    
    return res.status(201).json({
      tenant: {
        id,
        name,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply middleware
export default withTenant(withAuth(handler));
