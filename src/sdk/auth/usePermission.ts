'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Permission, ResourceType } from './client';
import { useUserContext } from '@/providers/UserProvider';

interface UsePermissionOptions {
  /**
   * Whether to skip the permission check
   * @default false
   */
  skip?: boolean;
}

/**
 * Hook to check if the current user has a specific permission
 * @param permission Permission to check
 * @param resourceType Resource type
 * @param resourceId Resource ID
 * @param options Options
 */
export function usePermission(
  permission: Permission,
  resourceType: ResourceType,
  resourceId: string,
  options: UsePermissionOptions = {}
) {
  const { skip = false } = options;
  const { checkPermission, isInitialized } = useAuth();
  const { user } = useUserContext();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(!skip);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const checkUserPermission = async () => {
      if (skip || !isInitialized || !user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await checkPermission(
          user.id,
          permission,
          resourceType,
          resourceId
        );
        
        setHasPermission(result);
      } catch (err) {
        console.error('Error checking permission:', err);
        setError(err instanceof Error ? err : new Error('Failed to check permission'));
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserPermission();
  }, [skip, isInitialized, user, permission, resourceType, resourceId, checkPermission]);
  
  return {
    hasPermission,
    isLoading,
    error,
  };
}
