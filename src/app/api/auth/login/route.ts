import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3040';
const COOKIE_NAME = 'auth_token'; // Choose a suitable cookie name

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || 'default'; // Get tenant from header (set by middleware)

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Call the actual auth service
    const authResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({ username, password }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return NextResponse.json({ error: authData.message || 'Authentication failed' }, { status: authResponse.status });
    }

    // Extract token and user info
    const { token, user, expiresIn } = authData;

    if (!token) {
        return NextResponse.json({ error: 'Login successful but no token received from auth service' }, { status: 500 });
    }

    // Set token in HTTP-only cookie
    const cookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Use secure in production
      maxAge: expiresIn || 3600, // Use expiry from auth service or default (e.g., 1 hour)
      path: '/', // Cookie available for all paths
      sameSite: 'lax', // Mitigate CSRF
    });

    // Return user info (without token) and set the cookie
    const response = NextResponse.json({ user });
    response.headers.set('Set-Cookie', cookie);

    return response;

  } catch (error) {
    console.error('Login API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}