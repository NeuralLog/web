import { NextApiRequest, NextApiResponse } from 'next';
import { AuthClient, TenantRole } from '@neurallog/auth-sdk';
import { getTenantId } from '@/services/tenantContext';

// Type for the next handler
type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * Middleware to set the tenant ID for the auth client
 */
export function withTenant(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get tenant ID from context
    const tenantId = getTenantId();
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID not found' });
    }
    
    // Add tenant ID to request for downstream middleware
    (req as any).tenantId = tenantId;
    
    // Call the next handler
    return handler(req, res);
  };
}

/**
 * Middleware to check if a user is authenticated
 */
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get user from session (this would use Clerk or your auth provider)
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Call the next handler
    return handler(req, res);
  };
}

/**
 * Middleware to check if a user is a member of the current tenant
 */
export function withTenantMembership(authClient: AuthClient, handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (req as any).user;
    const tenantId = (req as any).tenantId;
    
    if (!user || !tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      // Set the tenant ID in the auth client
      authClient.setTenantId(tenantId);
      
      // Check if the user is a member of the tenant using the auth client
      const isMember = await authClient.check({
        user: user.id,
        permission: 'member',
        resource: `tenant:${tenantId}`
      });
      
      if (!isMember) {
        return res.status(403).json({ error: 'Forbidden - Not a member of this tenant' });
      }
      
      // Call the next handler
      return handler(req, res);
    } catch (error) {
      console.error('Error checking tenant membership:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Middleware to check if a user is an admin of the current tenant
 */
export function withTenantAdmin(authClient: AuthClient, handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (req as any).user;
    const tenantId = (req as any).tenantId;
    
    if (!user || !tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      // Set the tenant ID in the auth client
      authClient.setTenantId(tenantId);
      
      // Check if the user is an admin of the tenant using the auth client
      const isAdmin = await authClient.check({
        user: user.id,
        permission: 'admin',
        resource: `tenant:${tenantId}`
      });
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
      }
      
      // Call the next handler
      return handler(req, res);
    } catch (error) {
      console.error('Error checking tenant admin:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Middleware to check if a user has permission to access a resource
 */
export function withPermission(authClient: AuthClient, permission: string, resourceGetter: (req: NextApiRequest) => string) {
  return function(handler: NextApiHandler): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const user = (req as any).user;
      const tenantId = (req as any).tenantId;
      
      if (!user || !tenantId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      try {
        // Set the tenant ID in the auth client
        authClient.setTenantId(tenantId);
        
        // Get the resource ID from the request
        const resourceId = resourceGetter(req);
        
        // Check if the user has permission to access the resource
        const hasPermission = await authClient.check({
          user: user.id,
          permission,
          resource: resourceId
        });
        
        if (!hasPermission) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        
        // Call the next handler
        return handler(req, res);
      } catch (error) {
        console.error('Error checking permission:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  };
}
