'use client';

import { useApp } from '@/hooks/useApp';

/**
 * Component that displays information about the current tenant and user
 */
export function TenantInfo() {
  const {
    tenantId,
    user,
    isLoading,
    hasAccess,
    error,
    isTenantLoading,
    tenantError
  } = useApp();

  if (isLoading) {
    return (
      <div className="p-4 border rounded-md shadow-sm">
        <div className="flex items-center justify-center h-[100px]">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" data-testid="loading-spinner"></div>
          <span className="ml-4">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
        <div className="font-bold">Error</div>
        <div>{error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h2 className="text-lg font-bold mb-2">Tenant Information</h2>

      <div className="font-bold mt-4">Tenant ID:</div>
      <div className="flex items-center">
        <span>{tenantId || 'No tenant selected'}</span>
        {isTenantLoading && (
          <div className="ml-2 animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" data-testid="tenant-loading-spinner"></div>
        )}
      </div>
      {tenantError && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded-md" role="alert">
          {tenantError.message}
        </div>
      )}

      <div className="font-bold mt-4">Current User:</div>
      {user ? (
        <div>{user.firstName} {user.lastName}</div>
      ) : (
        <div>Not authenticated</div>
      )}

      {tenantId && user && (
        <>
          <div className="font-bold mt-4">Access:</div>
          {hasAccess === true && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Has Access</span>}
          {hasAccess === false && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">No Access</span>}
          {hasAccess === null && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Unknown</span>}
        </>
      )}

      <div className="text-xs text-gray-500 mt-4">
        This tenant information is specific to this deployment and stored in Redis.
        Each tenant has its own namespace in Kubernetes with its own Redis instance.
      </div>
    </div>
  );
}
