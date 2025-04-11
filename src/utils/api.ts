/**
 * API utilities
 */
import { useAuth } from '@/context/AuthContext';

/**
 * Create authenticated fetch options
 * 
 * @param options Fetch options
 * @returns Fetch options with authentication headers
 */
export function useAuthenticatedFetch() {
  const { getAccessToken, user } = useAuth();
  
  /**
   * Fetch with authentication
   */
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    try {
      // Get the access token
      const token = await getAccessToken();
      
      // Create headers with authentication
      const headers = new Headers(options.headers || {});
      
      // Add the authorization header if we have a token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Add the tenant ID header
      headers.set('X-Tenant-ID', 'default');
      
      // Return the fetch promise
      return fetch(url, {
        ...options,
        headers
      });
    } catch (error) {
      console.error('Error creating authenticated fetch:', error);
      throw error;
    }
  };
  
  return { authenticatedFetch, user };
}
