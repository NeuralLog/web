import { authMiddleware } from '@clerk/nextjs';
 
/**
 * Clerk Authentication Middleware
 * 
 * This middleware handles authentication for all routes.
 * It runs after the tenant middleware (middleware.ts).
 */
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/api/health',
    '/login',
    '/sign-up',
    '/api/webhook/clerk',
    '/public/(.*)',
  ],
  
  // Optional: Define routes that should be ignored by the middleware
  ignoredRoutes: [
    '/_next/static/(.*)',
    '/favicon.ico',
    '/api/webhook/(.*)',
  ],
});
 
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
