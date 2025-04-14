'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
// We might not need these if token is handled server-side via cookies
// import { getAuthHeaders, createAuthenticatedClient } from '@neurallog/auth-client/nextjs';
import { useRouter } from 'next/navigation';

// Create a context for authentication
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  // token: string | null; // Token is now handled by httpOnly cookie
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  // getAuthHeaders: () => Record<string, string>; // Headers will be set by server/middleware
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  // const [token, setToken] = useState<string | null>(null); // Handled by cookie
  const [error, setError] = useState<string | null>(null);

  // Get configuration from environment variables
  // const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3040'; // No longer calling auth service directly
  const tenantId = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default'; // Still needed? Maybe passed by middleware? Check later.

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Call the /api/auth/me proxy route to check cookie and validate token
        const response = await fetch('/api/auth/me', {
          method: 'GET', // Use GET for checking status
          headers: {
            'Content-Type': 'application/json',
            // Tenant ID should be added by middleware if needed by /api/auth/me
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            // Not authenticated (valid response, but user is not logged in)
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
           // Error response from /api/auth/me (e.g., 401, 500)
           console.error('Auth check failed:', response.status, await response.text());
           setUser(null);
           setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Removed dependencies as we now call our own proxy

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      // Call the login proxy API route
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Tenant ID should be added by middleware if needed by /api/auth/login
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // No need to store token, cookie is set by the API route

      // Update state
      // Set user state from response
      setUser(data.user);
      setIsAuthenticated(true);

      // Redirect to dashboard
      router.push('/dashboard');

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);

      // Call the logout proxy API route
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Tenant ID should be added by middleware if needed by /api/auth/logout
        },
      });

      // Clear state
      setUser(null);
      setIsAuthenticated(false);

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // // Get auth headers for API requests - No longer needed client-side
  // const getAuthHeadersFn = () => {
  //   // Headers are handled by middleware/server-side fetching
  //   return {};
  // };

  // Create context value
  const authContextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    // token, // Removed
    login,
    logout,
    // getAuthHeaders: getAuthHeadersFn, // Removed
    error
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Higher-order component to protect routes
 */
export const withAuth = (Component: React.ComponentType<any>) => {
  const WithAuth = (props: any) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    // Check authentication on mount
    useEffect(() => {
      if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // Don't render anything while redirecting
    if (!isAuthenticated) {
      return null;
    }

    // Render component if authenticated
    return <Component {...props} />;
  };

  return WithAuth;
};

// /**
//  * Create an authenticated API client - This needs rethinking
//  * Client-side fetch calls won't automatically have the httpOnly cookie.
//  * API calls should ideally be proxied through Next.js API routes
//  * or made from Server Components where the cookie can be accessed.
//  */
// export const createAuthClient = (baseURL: string) => {
//   // This approach won't work directly with httpOnly cookies from the browser
//   // const { token } = useAuth(); // token is no longer available here
//   // const tenantId = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default';
//   // return createAuthenticatedClient(baseURL, token, tenantId);
// };
