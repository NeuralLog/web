import { NextRequest, NextResponse } from 'next/server';
import { systemSettingsService } from '@/services/systemSettingsService';

/**
 * GET /api/system/registration-status
 * Check if registration is locked
 */
export async function GET(req: NextRequest) {
  try {
    const isLocked = await systemSettingsService.isRegistrationLocked();
    return NextResponse.json({ isLocked });
  } catch (error) {
    console.error('Error checking registration status:', error);
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    );
  }
}
