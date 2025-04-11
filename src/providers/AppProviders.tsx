'use client';

import React from 'react';
import { TenantProvider } from './TenantProvider';
import { UserProvider } from './UserProvider';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from './ThemeProvider';

/**
 * Combined provider that wraps all the app providers
 * This should be used at the root of the application
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TenantProvider>
        <UserProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </UserProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
