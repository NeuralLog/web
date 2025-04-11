'use client';

import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

const UserProfile: React.FC = () => {
  const { user, tenantId, loading, error } = useUserProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8" role="status">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] mr-4"></div>
        <p className="text-lg">Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-4">Not Authenticated</h3>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  const formattedDate = new Date(user.createdAt).toLocaleDateString();

  return (
    <div className="p-8" data-testid="user-profile">
      <div className="flex flex-col space-y-6">
        <div className="flex space-x-6">
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="mt-2">{user.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-md p-4 w-full">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center">
              <p className="font-bold mr-2">User ID:</p>
              <p>{user.id}</p>
            </div>
            <div className="flex items-center">
              <p className="font-bold mr-2">Joined:</p>
              <p>{formattedDate}</p>
            </div>
            <div className="flex items-center">
              <p className="font-bold mr-2">Tenant:</p>
              <p>{tenantId}</p>
            </div>
            <div className="flex items-center">
              <p className="font-bold mr-2">Role:</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Member
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
