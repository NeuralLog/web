'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AuthProvider as Auth0AuthProvider, useAuth } from '@neurallog/auth-client/nextjs';

// Re-export the useAuth hook
export { useAuth } from '@neurallog/auth-client/nextjs';

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component that wraps the Auth0 provider
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Get configuration from environment variables
  const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3040';
  const tenantId = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default';

  return (
    <Auth0AuthProvider
      authServiceUrl={authServiceUrl}
      tenantId={tenantId}
      redirectUrl="/dashboard"
      loginUrl="/login"
    >
      {children}
    </Auth0AuthProvider>
  );
}

/**
 * Higher-order component to protect routes
 */
export { withAuth } from '@neurallog/auth-client/nextjs';

/**
 * Create an authenticated API client
 */
export { createAuthenticatedClient } from '@neurallog/auth-client/nextjs';
