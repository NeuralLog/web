import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cookie name for the token
const TOKEN_COOKIE_NAME = 'neurallog_auth_token';

// Auth service URL
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3040';

/**
 * POST /api/auth/exchange-token-for-resource
 * 
 * Exchange an authentication token for a resource-specific access token
 */
export async function POST(request: NextRequest) {
  try {
    // Get the resource from the request body
    const { resource } = await request.json();
    
    if (!resource) {
      return NextResponse.json({ error: 'Resource is required' }, { status: 400 });
    }
    
    // Get the token from the cookie
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }
    
    // Get tenant ID from headers
    const tenantId = request.headers.get('x-tenant-id') || 'default';
    
    // Exchange the token with the auth service
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/exchange-token-for-resource`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId
      },
      body: JSON.stringify({
        token,
        resource
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to exchange token' },
        { status: response.status }
      );
    }
    
    // Return the resource token
    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error('Error exchanging token for resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
