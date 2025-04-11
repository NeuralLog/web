'use client';

import React from 'react';
import { usePermission } from './usePermission';
import { Permission, ResourceType } from './client';

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
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2" data-testid="permission-spinner"></div>
        <span>Checking permissions...</span>
      </div>
    );
  }

  if (error && showError) {
    return (
      <div className="p-4 text-red-500">
        <span>Error checking permissions: {error.message}</span>
      </div>
    );
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
