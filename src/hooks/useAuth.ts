'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  tenantId: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        
        // Fetch the current user from the API
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated
            setUser(null);
            setIsLoading(false);
            return;
          }
          
          throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (fetchError) {
        console.error('Error fetching user:', fetchError);
        setError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setUser(data.user);
      
      return data.user;
    } catch (loginError) {
      console.error('Login error:', loginError);
      setError(loginError instanceof Error ? loginError : new Error(String(loginError)));
      throw loginError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Logout failed: ${response.status} ${response.statusText}`);
      }
      
      setUser(null);
    } catch (logoutError) {
      console.error('Logout error:', logoutError);
      setError(logoutError instanceof Error ? logoutError : new Error(String(logoutError)));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
  };
}
