import { NextRequest, NextResponse } from 'next/server';

/**
 * Authentication Middleware (Placeholder)
 *
 * This middleware is currently a placeholder after removing Clerk.
 * It will be updated later to handle token validation/forwarding.
 */
export default function authMiddleware(req: NextRequest) {
  // Currently does nothing, just passes the request through.
  return NextResponse.next();
}

// Keep the config to ensure it runs in the intended sequence,
// but the function itself is now a no-op.
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
