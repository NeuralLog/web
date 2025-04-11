import { NextRequest, NextResponse } from 'next/server';

// Get the logs server URL from environment variables
const LOGS_SERVER_URL = process.env.NEXT_PUBLIC_LOGS_SERVICE_API_URL || 'http://logs-server:3030';

/**
 * Proxy requests to the logs server
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`Proxying request to ${LOGS_SERVER_URL}/logs`);
    
    // Forward the request to the logs server
    const response = await fetch(`${LOGS_SERVER_URL}/logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'default',
      },
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Logs server returned error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      return NextResponse.json(
        { error: `Logs server error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return the response from the logs server
    const data = await response.json();
    console.log(`Logs server response:`, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to logs server:', error);
    return NextResponse.json(
      { error: `Failed to connect to logs server: ${error}` },
      { status: 500 }
    );
  }
}
