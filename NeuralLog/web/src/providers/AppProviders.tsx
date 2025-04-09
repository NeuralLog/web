'use client';

import React from 'react';
import { TenantProvider } from './TenantProvider';
import { UserProvider } from './UserProvider';
import { ChakraProvider } from './ChakraProvider';
import { AuthProvider } from '@/sdk/auth';

/**
 * Combined provider that wraps all the app providers
 * This should be used at the root of the application
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <TenantProvider>
        <UserProvider>
          <AuthProvider
            options={{
              apiUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_API_URL,
              apiKey: process.env.NEXT_PUBLIC_AUTH_SERVICE_API_KEY,
              cacheTtl: process.env.NEXT_PUBLIC_AUTH_CACHE_TTL ? parseInt(process.env.NEXT_PUBLIC_AUTH_CACHE_TTL) : undefined
            }}
          >
            {children}
          </AuthProvider>
        </UserProvider>
      </TenantProvider>
    </ChakraProvider>
  );
}
