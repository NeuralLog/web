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
const COOKIE_NAME = 'auth_token'; // Must match the name used in login/logout routes

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone(); // Clone URL for potential redirects

  // --- Tenant Identification ---
  const tenantId: string | null = extractTenantId(hostname);

  // Redirect if tenant cannot be identified for tenant-specific paths
  if (!tenantId && !isStaticAsset(pathname) && !isMainApp(pathname)) {
    url.pathname = '/'; // Redirect to a generic landing or error page
    url.search = ''; // Clear query params
    console.warn(`Redirecting: No tenant ID found for hostname ${hostname} on path ${pathname}`);
    // Avoid redirect loops if '/' is also considered not main app
    if (pathname !== '/') {
       return NextResponse.redirect(url);
    }
    // If even '/' fails tenant check, maybe show an error directly?
    // For now, let it pass to avoid loops, assuming '/' is always valid.
  }

  // --- Authentication Check ---
  const authToken = request.cookies.get(COOKIE_NAME)?.value;
  const isApiRoute = pathname.startsWith('/api');
  const isPublicPage = isPublicRoute(pathname); // Check if page is public

  // Redirect to login if trying to access protected page/API without token
  if (!isPublicPage && !isApiRoute && !authToken && !isStaticAsset(pathname)) {
      console.log(`Redirecting to login: No token for protected route ${pathname}`);
      url.pathname = '/login'; // Redirect to login page
      url.searchParams.set('redirectedFrom', pathname); // Optional: pass original path
      return NextResponse.redirect(url);
  }
  // Allow public pages and static assets regardless of token
  // API routes will handle their own auth checks based on token presence/validity

  // --- Header Modification ---
  const requestHeaders = new Headers(request.headers);
  // Set tenant ID for all requests (API routes, Server Components)
  if (tenantId) {
    requestHeaders.set('x-tenant-id', tenantId);
  }
  // Note: We don't add Authorization header here. API routes/Server Components
  // should read the cookie directly if they need to make authenticated calls.

  // --- Continue Request ---
  return NextResponse.next({
    request: {
      headers: requestHeaders, // Pass modified headers
    },
  });
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
