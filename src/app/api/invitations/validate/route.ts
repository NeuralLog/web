import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/services/invitationService';

/**
 * POST /api/invitations/validate
 * Validate an invitation
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, email } = data;

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the invitation
    const invitation = await invitationService.getInvitationById(id);
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation' },
        { status: 404 }
      );
    }
    
    // Check if invitation is for the correct email
    if (invitation.email !== email) {
      return NextResponse.json(
        { error: 'Invitation is for a different email address' },
        { status: 400 }
      );
    }
    
    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }
    
    // Check if invitation is already used
    if (invitation.used) {
      return NextResponse.json(
        { error: 'Invitation has already been used' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      valid: true,
      invitation
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}
