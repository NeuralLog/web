/**
 * Token Exchange Service
 *
 * This service handles exchanging Auth0 tokens for server access tokens
 * and resource-specific access tokens.
 */

/**
 * Exchange an Auth0 token for a server access token
 *
 * @param auth0Token The Auth0 token to exchange
 * @param tenantId The tenant ID
 * @returns A server access token
 */
export async function exchangeToken(auth0Token: string, tenantId: string = 'default'): Promise<string> {
  try {
    // Get the auth service URL from environment variables
    const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3040';

    // Exchange the token
    const response = await fetch(`${authServiceUrl}/api/auth/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        token: auth0Token,
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token exchange failed: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    // Get the server token from the response
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw error;
  }
}

/**
 * Exchange an authentication token for a resource-specific access token
 *
 * @param authToken Authentication token
 * @param resource Resource to access (e.g., 'logs:system-logs')
 * @param tenantId Tenant ID
 * @returns Resource-specific access token
 */
export async function exchangeTokenForResource(
  authToken: string,
  resource: string,
  tenantId: string = 'default'
): Promise<string> {
  try {
    // Get the auth service URL from environment variables
    const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3040';

    // Exchange the token
    const response = await fetch(`${authServiceUrl}/api/auth/exchange-token-for-resource`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        token: authToken,
        resource
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Resource token exchange failed: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Resource token exchange failed: ${response.status} ${response.statusText}`);
    }

    // Get the resource token from the response
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error exchanging token for resource:', error);
    throw error;
  }
}

/**
 * Get the authentication token from the cookie
 *
 * @returns Authentication token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    // Get the token from the cookie via the API route
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}
