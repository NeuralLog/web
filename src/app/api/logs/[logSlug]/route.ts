import { NextRequest, NextResponse } from 'next/server';

// Get the logs server URL from environment variables
const LOGS_SERVER_URL = process.env.NEXT_PUBLIC_LOGS_SERVICE_API_URL || 'http://logs-server:3030';

/**
 * Proxy requests to the logs server for a specific log
 */
export async function GET(
  request: NextRequest,
  context: { params: { logSlug: string } }
) {
  console.log('API route: GET /api/logs/[logSlug] called with context:', context);
  try {
    // Get the log slug from the URL path
    const { logSlug } = context.params;
    console.log('API route: logSlug from URL =', logSlug);
    console.log(`Proxying request to ${LOGS_SERVER_URL}/logs/${logSlug}`);

    // Get the limit parameter from the query string
    const requestUrl = new URL(request.url);
    const { searchParams } = requestUrl;
    const limit = searchParams.get('limit');

    // Build the target URL with the limit parameter if provided
    let targetUrl = `${LOGS_SERVER_URL}/logs/${logSlug}`;
    if (limit) {
      targetUrl += `?limit=${limit}`;
    }

    // Get Auth0 token from the request
    const authHeader = request.headers.get('Authorization');
    const auth0Token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

    // Get tenant ID from headers
    const tenantId = request.headers.get('X-Tenant-ID') || 'default';

    // Create headers for the logs server request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
    };

    // If we have an Auth0 token, exchange it for a server token
    if (auth0Token) {
      try {
        // Import the token exchange service
        const { exchangeToken } = await import('@/services/tokenExchangeService');

        // Exchange the token
        const serverToken = await exchangeToken(auth0Token, tenantId);

        // Add the server token to the headers
        headers['Authorization'] = `Bearer ${serverToken}`;
      } catch (error) {
        console.error('Failed to exchange token:', error);
      }
    }

    // Forward the request to the logs server
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
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
    console.log(`Logs server response for ${logSlug}:`, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to logs server:', error);
    return NextResponse.json(
      { error: `Failed to connect to logs server: ${error}` },
      { status: 500 }
    );
  }
}
