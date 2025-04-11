/**
 * Token Service
 * 
 * This service provides secure token storage and retrieval.
 * It uses HttpOnly cookies for secure storage when possible,
 * falling back to memory storage when cookies are not available.
 */

// In-memory token storage (used as fallback)
let memoryToken: string | null = null;

/**
 * Store a token securely
 * 
 * @param token The token to store
 */
export async function storeToken(token: string): Promise<void> {
  try {
    // Store the token in memory as a fallback
    memoryToken = token;
    
    // Store the token in an HttpOnly cookie via the API
    await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('Error storing token:', error);
    // Token is still stored in memory as fallback
  }
}

/**
 * Get the stored token
 * 
 * @returns The stored token or null if not found
 */
export async function getToken(): Promise<string | null> {
  try {
    // Try to get the token from the API (which will read the HttpOnly cookie)
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
    
    // Fall back to memory storage
    return memoryToken;
  } catch (error) {
    console.error('Error getting token:', error);
    // Fall back to memory storage
    return memoryToken;
  }
}

/**
 * Remove the stored token
 */
export async function removeToken(): Promise<void> {
  try {
    // Clear the token from memory
    memoryToken = null;
    
    // Clear the token cookie via the API
    await fetch('/api/auth/token', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error removing token:', error);
  }
}
