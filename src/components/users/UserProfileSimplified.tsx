'use client';

import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

// Separate the presentation from the data fetching
export const UserProfileUI: React.FC<{
  user: any | null;
  tenantId: string | null;
  loading: boolean;
  error: Error | null;
}> = ({ user, tenantId, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <div className="p-5 shadow-md border border-gray-200 rounded-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-5 shadow-md border border-gray-200 rounded-md bg-red-50">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold">Error</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="p-5 shadow-md border border-gray-200 rounded-md">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold">Not Authenticated</h3>
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  // User profile state
  return (
    <div className="p-5 shadow-md border border-gray-200 rounded-md">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold">
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
        <p>{user.emailAddresses[0]?.emailAddress}</p>
        {tenantId && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Tenant: {tenantId}</span>}
        <div className="flex space-x-4">
          <p className="text-sm">User ID: {user.id}</p>
          <p className="text-sm">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

// The main component that fetches data and renders the UI
const UserProfileSimplified: React.FC = () => {
  // Use the custom hook to fetch data
  const { user, tenantId, loading, error } = useUserProfile();

  // Render the UI component with the data
  return <UserProfileUI user={user} tenantId={tenantId} loading={loading} error={error} />;
};

export default UserProfileSimplified;
