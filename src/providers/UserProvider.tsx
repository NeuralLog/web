'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/userService';
import { useTenantContext } from './TenantProvider';

// Define the user type
interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  emailAddresses?: Array<{ emailAddress: string }>;
  [key: string]: any;
}

// Define the context type
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  error: null,
  refreshUser: async () => {},
});

// Hook to use the user context
export function useUserContext() {
  return useContext(UserContext);
}

// Provider component
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get the tenant context
  const { tenantId } = useTenantContext();

  // Function to load the current user
  const loadUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError(err instanceof Error ? err : new Error('Failed to load user'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load the user on mount and when tenant changes
  useEffect(() => {
    loadUser();
  }, [tenantId]);

  // Function to refresh the user
  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <UserContext.Provider value={{ user, isLoading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}
