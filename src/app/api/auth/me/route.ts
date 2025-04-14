import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers'; // Not needed if using request.cookies

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3040';
const COOKIE_NAME = 'auth_token'; // Must match the name used in login/logout

export async function GET(request: NextRequest) {
  try {
    // Get the token from the incoming request's cookies
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || 'default'; // Get tenant from header

    // Validate the token with the actual auth service
    const validateResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        // No Authorization header needed here, we're sending the token in the body
      },
      body: JSON.stringify({ token }),
    });

    const validateData = await validateResponse.json();

    if (!validateResponse.ok || !validateData.valid) {
      // If validation fails, instruct the client to clear the invalid cookie
      const response = NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
      // Clear the cookie by setting maxAge to 0
      response.headers.set('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV !== 'development' ? '; Secure' : ''}`);
      return response;
    }

    // Token is valid, return user information
    return NextResponse.json({ isAuthenticated: true, user: validateData.user });

  } catch (error) {
    console.error('/api/auth/me error:', error);
    // Return unauthenticated status on error, potentially clear cookie
    const response = NextResponse.json({ isAuthenticated: false, user: null, error: 'Internal Server Error' }, { status: 500 });
    response.headers.set('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV !== 'development' ? '; Secure' : ''}`);
    return response;
  }
}