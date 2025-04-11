import { NextRequest, NextResponse } from 'next/server';
import { systemSettingsService } from '@/services/systemSettingsService';

/**
 * POST /api/system/lock-registration
 * Lock registration after the first user registers
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId } = data;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await systemSettingsService.lockRegistration(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error locking registration:', error);
    return NextResponse.json(
      { error: 'Failed to lock registration' },
      { status: 500 }
    );
  }
}
