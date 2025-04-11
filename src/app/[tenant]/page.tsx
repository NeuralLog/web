'use client';

import UserProfile from '@/components/users/UserProfile';
import UserManagement from '@/components/users/UserManagement';

/**
 * Tenant Dashboard Page
 *
 * This is the main page for a tenant.
 */
export default function TenantDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <UserProfile />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <UserManagement />
        </div>
      </div>
    </div>
  );
}
