import { NextRequest, NextResponse } from 'next/server';
import { systemSettingsService } from '@/services/systemSettingsService';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api/auth';

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

   // Call the auth service to register the user
   const response = await fetch(`${AUTH_SERVICE_URL}/register`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ firstName, lastName, email, password })
   });

   if (!response.ok) {
     const errorData = await response.json();
     return NextResponse.json(
       { error: errorData.error || 'Failed to register user' },
       { status: response.status }
     );
   }

   const user = await response.json();
   return NextResponse.json(user);
 } catch (error) {
   console.error('Error registering user:', error);
   return NextResponse.json(
     { error: 'Failed to register user' },
     { status: 500 }
   );
 }
}
