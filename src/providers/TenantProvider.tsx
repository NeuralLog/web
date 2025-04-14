'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTenantId as getServerTenantId, setTenantId as setServerTenantId, getTenantIdSync } from '../services/tenantContext';
// Import clearTenantContextSync separately to avoid build issues
import { clearTenantContext } from '../services/tenantContext';

// Define the context type
interface TenantContextType {
  tenantId: string | null;
  isLoading: boolean;
  error: Error | null;
  setTenantId: (tenantId: string) => Promise<void>;
}

// Create the context with a default value
const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  isLoading: true,
  error: null,
  setTenantId: async () => {},
});

// Hook to use the tenant context
export function useTenantContext() {
  return useContext(TenantContext);
}

// Provider component
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(getTenantIdSync());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize tenant ID from Redis on mount
  useEffect(() => {
    const loadTenantId = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get the tenant ID from Redis
        const initialTenantId = await getServerTenantId();
        if (initialTenantId) {
          setTenantId(initialTenantId);
        }
      } catch (err) {
        console.error('Failed to load tenant ID:', err);
        setError(err instanceof Error ? err : new Error('Failed to load tenant ID'));
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantId();

    // Clean up when component unmounts
    return () => {
      // Use the asynchronous version for cleanup in useEffect
      try {
        // We can't use await in useEffect cleanup, but we can start the async operation
        clearTenantContext().catch(error => {
          console.error('Error clearing tenant context:', error);
        });
      } catch (error) {
        console.error('Error clearing tenant context:', error);
      }
    };
  }, []);

  // Update server-side tenant ID when it changes
  const handleSetTenantId = async (newTenantId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await setServerTenantId(newTenantId);
      setTenantId(newTenantId);
    } catch (err) {
      console.error('Failed to set tenant ID:', err);
      setError(err instanceof Error ? err : new Error('Failed to set tenant ID'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TenantContext.Provider value={{ tenantId, isLoading, error, setTenantId: handleSetTenantId }}>
      {children}
    </TenantContext.Provider>
  );
}
