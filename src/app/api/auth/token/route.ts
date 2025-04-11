import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cookie name for the token
const TOKEN_COOKIE_NAME = 'neurallog_auth_token';

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24, // 24 hours
  path: '/',
};

/**
 * GET /api/auth/token
 * 
 * Get the token from the HttpOnly cookie
 */
export async function GET(request: NextRequest) {
  try {
    // Get the token from the cookie
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 404 });
    }
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/auth/token
 * 
 * Store the token in an HttpOnly cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Get the token from the request body
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    
    // Set the token cookie
    const cookieStore = cookies();
    cookieStore.set(TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/token
 * 
 * Remove the token cookie
 */
export async function DELETE(request: NextRequest) {
  try {
    // Delete the token cookie
    const cookieStore = cookies();
    cookieStore.delete(TOKEN_COOKIE_NAME);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
