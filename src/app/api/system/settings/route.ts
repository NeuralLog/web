import { NextRequest, NextResponse } from 'next/server';
import { systemSettingsService } from '@/services/systemSettingsService';
import { useAuth } from '@/context/AuthContext';

/**
 * GET /api/system/settings
 * Get system settings
 */
export async function GET(req: NextRequest) {
  try {
    const settings = await systemSettingsService.getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error getting system settings:', error);
    return NextResponse.json(
      { error: 'Failed to get system settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/system/settings
 * Update system settings
 * Requires admin privileges
 */
export async function POST(req: NextRequest) {
  try {
    // In a real application, we would check if the user is an admin
    // For now, we'll just update the settings
    const data = await req.json();
    await systemSettingsService.saveSettings(data.settings);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
