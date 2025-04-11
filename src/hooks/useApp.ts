'use client';

import { useTenantContext } from '@/providers/TenantProvider';
import { useUserContext } from '@/providers/UserProvider';
import { isUserInTenant } from '@/services/userService';
import { useEffect, useState } from 'react';

/**
 * Hook that provides access to both tenant and user context
 * Also checks if the current user has access to the current tenant
 */
export function useApp() {
  const { tenantId, setTenantId, isLoading: isTenantLoading, error: tenantError } = useTenantContext();
  const { user, isLoading: isUserLoading, error: userError, refreshUser } = useUserContext();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState<boolean>(false);
  const [accessError, setAccessError] = useState<Error | null>(null);

  // Check if the user has access to the tenant
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !tenantId) {
        setHasAccess(null);
        setAccessError(null);
        return;
      }

      setIsCheckingAccess(true);
      setAccessError(null);

      try {
        const access = await isUserInTenant(user.id, tenantId);
        setHasAccess(access);
      } catch (error) {
        console.error('Failed to check tenant access:', error);
        setHasAccess(false);
        setAccessError(error instanceof Error ? error : new Error('Failed to check tenant access'));
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, tenantId]);

  return {
    // Tenant
    tenantId,
    setTenantId,
    isTenantLoading,
    tenantError,

    // User
    user,
    isUserLoading,
    userError,
    refreshUser,

    // Access
    hasAccess,
    isCheckingAccess,
    accessError,

    // Combined state
    isLoading: isTenantLoading || isUserLoading || isCheckingAccess,
    error: tenantError || userError || accessError,
  };
}
