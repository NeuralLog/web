import { NextRequest, NextResponse } from 'next/server';
import { LogsApiClient } from '@/sdk/logs/api-client';

/**
 * GET /api/logs/[logSlug]/statistics
 * 
 * Get statistics for a specific log
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { logSlug: string } }
) {
  try {
    // Get log slug from URL
    const { logSlug } = params;

    // Get tenant ID from headers
    const tenantId = request.headers.get('X-Tenant-ID') || 'default';

    // Create logs API client
    const client = new LogsApiClient({
      apiUrl: process.env.LOGS_API_URL || 'http://localhost:3030',
      tenantId
    });

    // Get statistics
    const statistics = await client.getLogStatistics(logSlug);

    // Return statistics
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error getting log statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get log statistics' },
      { status: 500 }
    );
  }
}
