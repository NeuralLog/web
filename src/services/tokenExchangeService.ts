/**
 * Token Exchange Service
 * 
 * This service handles exchanging Auth0 tokens for server access tokens
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
