import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/services/invitationService';

/**
 * POST /api/invitations/[id]/use
 * Mark an invitation as used
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Mark invitation as used
    const success = await invitationService.useInvitation(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to use invitation' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error using invitation:', error);
    return NextResponse.json(
      { error: 'Failed to use invitation' },
      { status: 500 }
    );
  }
}
