import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/services/invitationService';
import { systemSettingsService } from '@/services/systemSettingsService';

/**
 * GET /api/invitations
 * Get all invitations
 */
export async function GET(req: NextRequest) {
  try {
    const invitations = await invitationService.getInvitations();
    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error getting invitations:', error);
    return NextResponse.json(
      { error: 'Failed to get invitations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations
 * Create a new invitation
 */
export async function POST(req: NextRequest) {
  try {
    // Check if registration is locked
    const isLocked = await systemSettingsService.isRegistrationLocked();
    if (!isLocked) {
      return NextResponse.json(
        { error: 'Registration is not locked, invitations are not required' },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { email, invitedBy } = data;

    if (!email || !invitedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const invitation = await invitationService.createInvitation(email, invitedBy);
    
    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
