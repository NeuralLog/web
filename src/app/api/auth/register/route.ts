import { NextRequest, NextResponse } from 'next/server';
import { systemSettingsService } from '@/services/systemSettingsService';

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(req: NextRequest) {
  try {
    // Check if registration is locked
    const isLocked = await systemSettingsService.isRegistrationLocked();
    if (isLocked) {
      return NextResponse.json(
        { error: 'Registration is currently locked' },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { firstName, lastName, email, password } = data;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, we would call the Auth0 API to create a user
    // For now, we'll simulate a successful registration
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock user object
    const user = {
      sub: `auth0|${Date.now()}`,
      name: `${firstName} ${lastName}`,
      email,
      email_verified: false,
      picture: '',
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
