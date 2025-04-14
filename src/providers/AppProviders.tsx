'use client';

import React from 'react';
import { TenantProvider } from './TenantProvider';
import { UserProvider } from './UserProvider';
import { AuthProvider as AuthenticationProvider } from '../context/AuthContext'; // Rename to avoid clash
import { AuthProvider as AuthorizationProvider } from '../sdk/auth/AuthProvider'; // Import SDK provider
import { ThemeProvider } from './ThemeProvider';
import { CryptoProvider } from '../components/crypto';

/**
 * Combined provider that wraps all the app providers
 * This should be used at the root of the application
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TenantProvider>
        <UserProvider>
          {/* Authentication Context (Login/Logout/User State) */}
          <AuthenticationProvider>
            {/* Authorization Context (Permissions/Roles via SDK) */}
            <AuthorizationProvider>
              <CryptoProvider>
                {children}
              </CryptoProvider>
            </AuthorizationProvider>
          </AuthenticationProvider>
        </UserProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
