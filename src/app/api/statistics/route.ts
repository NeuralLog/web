import { NextRequest, NextResponse } from 'next/server';
import { LogsApiClient } from '@/sdk/logs/api-client';

/**
 * GET /api/statistics
 * 
 * Get aggregate statistics for all logs
 */
export async function GET(request: NextRequest) {
  try {
    // Get tenant ID from headers
    const tenantId = request.headers.get('X-Tenant-ID') || 'default';

    // Create logs API client
    const client = new LogsApiClient({
      apiUrl: process.env.LOGS_API_URL || 'http://localhost:3030',
      tenantId
    });

    // Get statistics
    const statistics = await client.getAggregateStatistics();

    // Return statistics
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error getting statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
