'use client';

import React from 'react';
import { usePermission } from './usePermission';
import { Permission, ResourceType } from './client';
import { Spinner, Box, Text } from '@chakra-ui/react';

interface PermissionGuardProps {
  /**
   * Permission required to access the content
   */
  permission: Permission;
  
  /**
   * Resource type
   */
  resourceType: ResourceType;
  
  /**
   * Resource ID
   */
  resourceId: string;
  
  /**
   * Content to render if the user has permission
   */
  children: React.ReactNode;
  
  /**
   * Content to render if the user doesn't have permission
   * @default null
   */
  fallback?: React.ReactNode;
  
  /**
   * Whether to show a loading indicator
   * @default true
   */
  showLoading?: boolean;
  
  /**
   * Whether to show an error message
   * @default true
   */
  showError?: boolean;
}

/**
 * Component that conditionally renders content based on user permissions
 */
export function PermissionGuard({
  permission,
  resourceType,
  resourceId,
  children,
  fallback = null,
  showLoading = true,
  showError = true,
}: PermissionGuardProps) {
  const { hasPermission, isLoading, error } = usePermission(
    permission,
    resourceType,
    resourceId
  );
  
  if (isLoading && showLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={4}>
        <Spinner size="sm" mr={2} />
        <Text>Checking permissions...</Text>
      </Box>
    );
  }
  
  if (error && showError) {
    return (
      <Box p={4} color="red.500">
        <Text>Error checking permissions: {error.message}</Text>
      </Box>
    );
  }
  
  if (hasPermission) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
