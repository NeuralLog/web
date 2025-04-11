import { NextRequest, NextResponse } from 'next/server';
import { LogsApiClient } from '@/sdk/logs/api-client';

/**
 * GET /api/logs
 *
 * Get all logs
 */
export async function GET(request: NextRequest) {
  try {
    // Get tenant ID from headers
    const tenantId = request.headers.get('X-Tenant-ID') || 'default';

    // Get Auth0 token from the request
    const authHeader = request.headers.get('Authorization');
    const auth0Token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

    // Create logs API client
    const client = new LogsApiClient({
      apiUrl: process.env.LOGS_API_URL || 'http://localhost:3030',
      tenantId,
      auth0Token
    });

    // Get all logs
    const logs = await client.getLogs();

    // Return logs
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error getting logs:', error);
    return NextResponse.json(
      { error: 'Failed to get logs' },
      { status: 500 }
    );
  }
}
