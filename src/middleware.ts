import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware
 *
 * This middleware runs at the edge and handles:
 * 1. Tenant identification from hostname
 * 2. Setting tenant ID in headers for API routes
 * 3. URL rewrites for tenant-specific routes
 *
 * IMPORTANT: Edge middleware is extremely limited and can only do URL rewrites
 * and header modifications. Complex logic must be in the API routes.
 *
 * Authentication is handled separately by Clerk middleware in auth-middleware.ts
 */
export function middleware(request: NextRequest) {
  // Get hostname (e.g. localhost:3000)
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Extract tenant ID from hostname
  let tenantId: string | null = extractTenantId(hostname);

  // If no tenant ID found and not accessing the main app or static assets
  if (!tenantId && !isStaticAsset(pathname) && !isMainApp(pathname)) {
    // Redirect to the main app
    return NextResponse.redirect(new URL('http://localhost:3000', request.url));
  }

  // For API routes, add the tenant ID as a header
  if (pathname.startsWith('/api')) {
    const requestHeaders = new Headers(request.headers);
    if (tenantId) {
      requestHeaders.set('x-tenant-id', tenantId);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Continue with the request
  return NextResponse.next();
}

/**
 * Extract tenant ID from hostname
 */
function extractTenantId(hostname: string): string | null {
  // For local development, always return 'default' tenant
  if (hostname.includes('localhost')) {
    return 'default';
  }

  // Check for subdomain pattern (tenant.neurallog.app)
  if (hostname.endsWith('.neurallog.app')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain && subdomain !== 'www') {
      return subdomain;
    }
  }

  // For custom domains, we would need a static mapping
  // This would be defined in environment variables or config
  // Edge middleware cannot make API calls to look up mappings

  return null;
}

/**
 * Check if the path is a static asset
 */
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.includes('/static/') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  );
}

/**
 * Check if the path is for the main app (not tenant-specific)
 */
function isMainApp(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/public/')
  );
}

/**
 * Check if the path is a public route that doesn't require authentication
 */
function isPublicRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/sign-up' ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/webhook/clerk')
  );
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all pages except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
