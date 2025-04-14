import { NextRequest, NextResponse } from 'next/server';
import { NeuralLogClient } from '@neurallog/client-sdk';

/**
 * POST /api/auth/change-password
 * Change user password
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { oldPassword, newPassword } = data;

    // Validate input
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const neuralLogClient = new NeuralLogClient();
    const result = await neuralLogClient.changePassword(oldPassword, newPassword);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to change password' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}