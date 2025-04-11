'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient, Permission, ResourceType, AuthClientOptions } from './client';
import { useTenantContext } from '@/providers/TenantProvider';

// Define the context type
interface AuthContextType {
  client: AuthClient | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  checkPermission: (
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ) => Promise<boolean>;
  grantPermission: (
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ) => Promise<boolean>;
  revokePermission: (
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ) => Promise<boolean>;
  isUserInTenant: (userId: string) => Promise<boolean>;
  isUserTenantAdmin: (userId: string) => Promise<boolean>;
  addUserToTenant: (userId: string, isAdmin?: boolean) => Promise<boolean>;
  removeUserFromTenant: (userId: string) => Promise<boolean>;
  updateUserRole: (userId: string, isAdmin: boolean) => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  client: null,
  isInitialized: false,
  isInitializing: false,
  error: null,
  checkPermission: async () => false,
  grantPermission: async () => false,
  revokePermission: async () => false,
  isUserInTenant: async () => false,
  isUserTenantAdmin: async () => false,
  addUserToTenant: async () => false,
  removeUserFromTenant: async () => false,
  updateUserRole: async () => false,
});

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
  options?: AuthClientOptions;
}

// Provider component
export function AuthProvider({ children, options = {} }: AuthProviderProps) {
  const [client, setClient] = useState<AuthClient | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { tenantId } = useTenantContext();
  
  // Initialize the auth client
  useEffect(() => {
    const initializeClient = async () => {
      if (isInitializing || isInitialized) {
        return;
      }
      
      setIsInitializing(true);
      setError(null);
      
      try {
        // Create a new auth client
        const newClient = new AuthClient(options);
        
        // Initialize the client
        await newClient.initialize();
        
        setClient(newClient);
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize auth client:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize auth client'));
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeClient();
    
    // Clean up
    return () => {
      // No cleanup needed for now
    };
  }, [options, isInitializing, isInitialized]);
  
  // Update tenant ID when it changes
  useEffect(() => {
    if (client && tenantId) {
      client.setTenantId(tenantId);
    }
  }, [client, tenantId]);
  
  // Check permission
  const checkPermission = async (
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<boolean> => {
    if (!client) {
      return false;
    }
    
    try {
      return await client.check(userId, permission, resourceType, resourceId);
    } catch (err) {
      console.error('Error checking permission:', err);
      return false;
    }
  };
  
  // Grant permission
  const grantPermission = async (
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<boolean> => {
    if (!client) {
      return false;
    }
    
    try {
      return await client.grant(userId, permission, resourceType, resourceId);
    } catch (err) {
      console.error('Error granting permission:', err);
      return false;
    }
  };
  
  // Revoke permission
  const revokePermission = async (
    userId: string,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<boolean> => {
    if (!client) {
      return false;
    }
    
    try {
      return await client.revoke(userId, permission, resourceType, resourceId);
    } catch (err) {
      console.error('Error revoking permission:', err);
      return false;
    }
  };
  
  // Check if user is in tenant
  const isUserInTenant = async (userId: string): Promise<boolean> => {
    if (!client) {
      return false;
    }
    
    try {
      return await client.isUserInTenant(userId);
    } catch (err) {
      console.error('Error checking if user is in tenant:', err);
      return false;
    }
  };
  
  // Check if user is tenant admin
  const isUserTenantAdmin = async (userId: string): Promise<boolean> => {
    if (!client) {
      return false;
    }
    
    try {
      return await client.isUserTenantAdmin(userId);
    } catch (err) {
      console.error('Error checking if user is tenant admin:', err);
      return false;
    }
  };
  
  // Add user to tenant
  const addUserToTenant = async (userId: string, isAdmin: boolean = false): Promise<boolean> => {
    if (!client) {
      return false;
    }
    
    try {
      return await client.addUserToTenant(userId, isAdmin);
    } catch (err) {
      console.error('Error adding user to tenant:', err);
      return false;
    }
  };
  
  // Remove user from tenant
  const removeUserFromTenant = async (userId: string): Promise<boolean> => {
    if (!client) {
      return false;
    }
    
    try {
      return await client.removeUserFromTenant(userId);
    } catch (err) {
      console.error('Error removing user from tenant:', err);
      return false;
    }
  };
  
  // Update user role
  const updateUserRole = async (userId: string, isAdmin: boolean): Promise<boolean> => {
    if (!client) {
      return false;
    }
    
    try {
      return await client.updateUserRole(userId, isAdmin);
    } catch (err) {
      console.error('Error updating user role:', err);
      return false;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        client,
        isInitialized,
        isInitializing,
        error,
        checkPermission,
        grantPermission,
        revokePermission,
        isUserInTenant,
        isUserTenantAdmin,
        addUserToTenant,
        removeUserFromTenant,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
