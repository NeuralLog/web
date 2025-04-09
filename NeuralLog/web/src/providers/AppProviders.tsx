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
              useTenantSpecificInstances: process.env.NODE_ENV === 'production',
              storeId: process.env.NEXT_PUBLIC_OPENFGA_STORE_ID,
              authorizationModelId: process.env.NEXT_PUBLIC_OPENFGA_MODEL_ID
            }}
          >
            {children}
          </AuthProvider>
        </UserProvider>
      </TenantProvider>
    </ChakraProvider>
  );
}
