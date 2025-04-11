'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth, Permission, ResourceType, PermissionGuard } from '@/sdk/auth';
import { useUserContext } from '@/providers/UserProvider';
import { useTenantContext } from '@/providers/TenantProvider';

export function AuthDemo() {
  const {
    isInitialized,
    isInitializing,
    error,
    checkPermission,
    grantPermission,
    revokePermission,
    isUserInTenant,
    isUserTenantAdmin,
    addUserToTenant,
    removeUserFromTenant,
    updateUserRole
  } = useAuth();

  const { user } = useUserContext();
  const { tenantId } = useTenantContext();

  // Simple toast function to replace Chakra's useToast
  const showToast = (title: string, description?: string, status: 'success' | 'error' | 'warning' = 'success') => {
    // In a real app, you would implement a toast notification system
    console.log(`${status.toUpperCase()}: ${title}${description ? ` - ${description}` : ''}`);
    // For now, we'll just use alert for demonstration
    alert(`${title}${description ? `\n${description}` : ''}`);
  };

  const [selectedPermission, setSelectedPermission] = useState<Permission>(Permission.READ);
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType>(ResourceType.LOG);
  const [resourceId, setResourceId] = useState<string>('system-logs');
  const [checkResult, setCheckResult] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check permission
  const handleCheckPermission = async () => {
    if (!user) {
      showToast('No user', 'You need to be logged in to check permissions', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await checkPermission(
        user.id,
        selectedPermission,
        selectedResourceType,
        resourceId
      );

      setCheckResult(result);

      showToast(
        result ? 'Permission granted' : 'Permission denied',
        undefined,
        result ? 'success' : 'warning'
      );
    } catch (err) {
      console.error('Error checking permission:', err);
      showToast('Error', 'Failed to check permission', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Grant permission
  const handleGrantPermission = async () => {
    if (!user) {
      showToast('No user', 'You need to be logged in to grant permissions', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await grantPermission(
        user.id,
        selectedPermission,
        selectedResourceType,
        resourceId
      );

      if (result) {
        showToast(
          'Permission granted',
          `Granted ${selectedPermission} permission on ${selectedResourceType}:${resourceId}`,
          'success'
        );

        // Update check result
        setCheckResult(true);
      } else {
        showToast('Failed to grant permission', undefined, 'error');
      }
    } catch (err) {
      console.error('Error granting permission:', err);
      showToast('Error', 'Failed to grant permission', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke permission
  const handleRevokePermission = async () => {
    if (!user) {
      showToast('No user', 'You need to be logged in to revoke permissions', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await revokePermission(
        user.id,
        selectedPermission,
        selectedResourceType,
        resourceId
      );

      if (result) {
        showToast(
          'Permission revoked',
          `Revoked ${selectedPermission} permission on ${selectedResourceType}:${resourceId}`,
          'success'
        );

        // Update check result
        setCheckResult(false);
      } else {
        showToast('Failed to revoke permission', undefined, 'error');
      }
    } catch (err) {
      console.error('Error revoking permission:', err);
      showToast('Error', 'Failed to revoke permission', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is in tenant
  const handleCheckTenantMembership = async () => {
    if (!user) {
      showToast('No user', 'You need to be logged in to check tenant membership', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await isUserInTenant(user.id);

      showToast(
        result ? 'User is a tenant member' : 'User is not a tenant member',
        undefined,
        result ? 'success' : 'warning'
      );
    } catch (err) {
      console.error('Error checking tenant membership:', err);
      showToast('Error', 'Failed to check tenant membership', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is tenant admin
  const handleCheckTenantAdmin = async () => {
    if (!user) {
      showToast('No user', 'You need to be logged in to check tenant admin status', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await isUserTenantAdmin(user.id);

      showToast(
        result ? 'User is a tenant admin' : 'User is not a tenant admin',
        undefined,
        result ? 'success' : 'warning'
      );
    } catch (err) {
      console.error('Error checking tenant admin status:', err);
      showToast('Error', 'Failed to check tenant admin status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border border-gray-200 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Auth SDK Demo</h2>

      <div className="flex flex-col space-y-4">
        {/* Status */}
        <div>
          <p className="font-bold">Status:</p>
          <div className="flex mt-2 space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isInitialized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {isInitializing ? 'Initializing...' : isInitialized ? 'Initialized' : 'Not Initialized'}
            </span>

            {error && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Error: {error.message}
              </span>
            )}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* User Info */}
        <div>
          <p className="font-bold">User:</p>
          {user ? (
            <p className="mt-2">
              {user.firstName} {user.lastName} ({user.id})
            </p>
          ) : (
            <p className="mt-2 text-gray-500">Not logged in</p>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Tenant Info */}
        <div>
          <p className="font-bold">Tenant:</p>
          {tenantId ? (
            <p className="mt-2">{tenantId}</p>
          ) : (
            <p className="mt-2 text-gray-500">No tenant selected</p>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Permission Check Form */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Check/Manage Permissions</h3>

          <div className="flex flex-col space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
              <Select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value as Permission)}
              >
                {Object.values(Permission).map((permission) => (
                  <option key={permission} value={permission}>
                    {permission}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
              <Select
                value={selectedResourceType}
                onChange={(e) => setSelectedResourceType(e.target.value as ResourceType)}
              >
                {Object.values(ResourceType).map((resourceType) => (
                  <option key={resourceType} value={resourceType}>
                    {resourceType}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
              <Input
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                placeholder="e.g., system-logs"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                variant="default"
                onClick={handleCheckPermission}
                disabled={isLoading || !isInitialized || !user}
              >
                Check Permission
              </Button>

              <Button
                variant="success"
                onClick={handleGrantPermission}
                disabled={isLoading || !isInitialized || !user}
              >
                Grant Permission
              </Button>

              <Button
                variant="destructive"
                onClick={handleRevokePermission}
                disabled={isLoading || !isInitialized || !user}
              >
                Revoke Permission
              </Button>
            </div>

            {checkResult !== null && (
              <span className={`inline-block px-3 py-2 text-sm font-medium rounded-md ${checkResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {checkResult ? 'Permission Granted' : 'Permission Denied'}
              </span>
            )}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Tenant Membership */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Tenant Membership</h3>

          <div className="flex space-x-4">
            <Button
              variant="default"
              onClick={handleCheckTenantMembership}
              disabled={isLoading || !isInitialized || !user || !tenantId}
            >
              Check Tenant Membership
            </Button>

            <Button
              variant="default"
              onClick={handleCheckTenantAdmin}
              disabled={isLoading || !isInitialized || !user || !tenantId}
            >
              Check Tenant Admin
            </Button>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Permission Guard Demo */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Permission Guard Demo</h3>

          <PermissionGuard
            permission={Permission.READ}
            resourceType={ResourceType.LOG}
            resourceId="system-logs"
            fallback={
              <div className="p-4 bg-red-50 rounded-md">
                <p>You don't have permission to view system logs.</p>
                <Button
                  className="mt-2"
                  size="sm"
                  variant="success"
                  onClick={() => grantPermission(
                    user?.id || '',
                    Permission.READ,
                    ResourceType.LOG,
                    'system-logs'
                  )}
                  disabled={!isInitialized || !user}
                >
                  Grant Access
                </Button>
              </div>
            }
          >
            <div className="p-4 bg-green-50 rounded-md">
              <p>You have permission to view system logs.</p>
              <p className="text-sm mt-2">This content is protected by PermissionGuard.</p>
              <Button
                className="mt-2"
                size="sm"
                variant="destructive"
                onClick={() => revokePermission(
                  user?.id || '',
                  Permission.READ,
                  ResourceType.LOG,
                  'system-logs'
                )}
                disabled={!isInitialized || !user}
              >
                Revoke Access
              </Button>
            </div>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}
