'use client';

import { useState, useEffect } from 'react';
import { getTenantId } from '@/services/tenantContext';
import { getCurrentUser } from '@/services/userService';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  emailAddresses: Array<{ emailAddress: string }>;
  imageUrl: string;
  createdAt: string;
}

export interface UserProfileData {
  user: User | null;
  tenantId: string | null;
  loading: boolean;
  error: Error | null;
}

export function useUserProfile(): UserProfileData {
  const [user, setUser] = useState<User | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const tenantIdData = await getTenantId();
        setTenantId(tenantIdData);
        
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load user data'));
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  return { user, tenantId, loading, error };
}
