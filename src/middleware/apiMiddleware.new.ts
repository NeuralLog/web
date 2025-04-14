import { NextApiRequest, NextApiResponse } from 'next';
import { AuthClient } from '@/sdk/auth/api-client';

export type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

/**
 * Middleware to extract tenant ID from request
 */
export function createTenantExtractorMiddleware() {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    // Get tenant ID from header or use default
    const tenantId = req.headers['x-tenant-id'] as string || 'default';
    
    // Add tenant ID to request
    (req as any).tenantId = tenantId;
    
    // Call the next middleware
    next();
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
 * This middleware only checks if the user is authenticated, not if they have permission
 */
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get user from session (this would use your auth provider)
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Call the next handler
    return handler(req, res);
  };
}

/**
 * Helper function to adapt Express-style middleware to Next.js API routes
 */
export function adaptMiddleware(middleware: any) {
  return (handler: NextApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      await new Promise<void>((resolve) => {
        middleware(req, res, resolve);
      });
      
      return handler(req, res);
    };
  };
}
