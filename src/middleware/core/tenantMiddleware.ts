/**
 * Core tenant middleware
 * Framework-agnostic implementation that can be used with any HTTP server
 */

import { AuthClient } from '@neurallog/auth-sdk';

// Generic request and response types
export interface Request {
  headers: Record<string, string | string[] | undefined>;
  user?: { id: string; [key: string]: any };
  tenantId?: string;
  [key: string]: any;
}

export interface Response {
  status(code: number): Response;
  json(body: any): void;
  setHeader(name: string, value: string): Response;
  [key: string]: any;
}

export type NextHandler = () => void | Promise<void>;

/**
 * Middleware to check if a user is a member of a tenant
 */
export function createTenantMembershipMiddleware(authClient: AuthClient) {
  return async function checkTenantMembership(
    req: Request,
    res: Response,
    next: NextHandler,
    tenantIdGetter: (req: Request) => string = (req) => req.tenantId || ''
  ) {
    const userId = req.user?.id;
    const tenantId = tenantIdGetter(req);
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID not found' });
      return;
    }
    
    try {
      // Set the tenant ID in the auth client
      authClient.setTenantId(tenantId);
      
      // Check if the user is a member of the tenant
      const isMember = await authClient.check({
        user: userId,
        permission: 'member',
        resource: `tenant:${tenantId}`
      });
      
      if (!isMember) {
        res.status(403).json({ error: 'Forbidden - Not a member of this tenant' });
        return;
      }
      
      // Continue to the next middleware
      await next();
    } catch (error) {
      console.error('Error checking tenant membership:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Middleware to check if a user is an admin of a tenant
 */
export function createTenantAdminMiddleware(authClient: AuthClient) {
  return async function checkTenantAdmin(
    req: Request,
    res: Response,
    next: NextHandler,
    tenantIdGetter: (req: Request) => string = (req) => req.tenantId || ''
  ) {
    const userId = req.user?.id;
    const tenantId = tenantIdGetter(req);
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID not found' });
      return;
    }
    
    try {
      // Set the tenant ID in the auth client
      authClient.setTenantId(tenantId);
      
      // Check if the user is an admin of the tenant
      const isAdmin = await authClient.check({
        user: userId,
        permission: 'admin',
        resource: `tenant:${tenantId}`
      });
      
      if (!isAdmin) {
        res.status(403).json({ error: 'Forbidden - Admin access required' });
        return;
      }
      
      // Continue to the next middleware
      await next();
    } catch (error) {
      console.error('Error checking tenant admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Middleware to extract tenant ID from request
 */
export function createTenantExtractorMiddleware() {
  return function extractTenantId(
    req: Request,
    res: Response,
    next: NextHandler
  ) {
    // Try to get tenant ID from headers first (set by edge middleware)
    const tenantIdHeader = req.headers['x-tenant-id'];
    if (tenantIdHeader && typeof tenantIdHeader === 'string') {
      req.tenantId = tenantIdHeader;
      return next();
    }
    
    // If not in headers, try to get from hostname
    const hostname = req.headers.host || '';
    
    // Check for subdomain pattern (tenant.neurallog.app)
    if (typeof hostname === 'string' && hostname.endsWith('.neurallog.app')) {
      const subdomain = hostname.split('.')[0];
      if (subdomain && subdomain !== 'www') {
        req.tenantId = subdomain;
        return next();
      }
    }
    
    // No tenant ID found
    res.status(400).json({ error: 'Tenant ID not found' });
  };
}
