import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

const COOKIE_NAME = 'auth_token'; // Must match the name used in the login route

export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie by setting its maxAge to 0
    const cookie = serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 0, // Expire the cookie immediately
      path: '/',
      sameSite: 'lax',
    });

    // Return a success response and clear the cookie
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.headers.set('Set-Cookie', cookie);

    return response;

  } catch (error) {
    console.error('Logout API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}