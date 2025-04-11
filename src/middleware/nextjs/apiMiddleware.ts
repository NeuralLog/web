/**
 * Next.js-specific API middleware adapters
 * These adapters wrap the core middleware for use with Next.js API routes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { AuthClient } from '@neurallog/auth-sdk';
import { 
  createTenantMembershipMiddleware, 
  createTenantAdminMiddleware,
  createTenantExtractorMiddleware,
  Request,
  Response,
  NextHandler
} from '../core/tenantMiddleware';

// Type for Next.js API handler
type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

// Adapter function to convert Next.js middleware signature to core middleware signature
function adaptMiddleware(
  middleware: (req: Request, res: Response, next: NextHandler) => Promise<void> | void
) {
  return function(handler: NextApiHandler): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      await middleware(req as unknown as Request, res as unknown as Response, async () => {
        await handler(req, res);
      });
    };
  };
}

/**
 * Middleware to extract tenant ID from request
 */
export function withTenant(handler: NextApiHandler): NextApiHandler {
  const extractTenant = createTenantExtractorMiddleware();
  return adaptMiddleware(extractTenant)(handler);
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
export function withTenantMembership(authClient: AuthClient) {
  const checkMembership = createTenantMembershipMiddleware(authClient);
  
  return function(handler: NextApiHandler): NextApiHandler {
    return adaptMiddleware((req, res, next) => 
      checkMembership(req, res, next)
    )(handler);
  };
}

/**
 * Middleware to check if a user is an admin of the current tenant
 */
export function withTenantAdmin(authClient: AuthClient) {
  const checkAdmin = createTenantAdminMiddleware(authClient);
  
  return function(handler: NextApiHandler): NextApiHandler {
    return adaptMiddleware((req, res, next) => 
      checkAdmin(req, res, next)
    )(handler);
  };
}

/**
 * Middleware to check if a user has permission to access a resource
 */
export function withPermission(
  authClient: AuthClient, 
  permission: string, 
  resourceGetter: (req: NextApiRequest) => string
) {
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
