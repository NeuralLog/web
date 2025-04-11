/**
 * Mock User Profile Component for Testing
 */

import React from 'react';

// Mock implementation of UserProfile for testing
export default function UserProfile() {
  // Mock state
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Simulate useEffect
  React.useEffect(() => {
    const mockUserService = require('@/services/userService');
    const mockTenantContext = require('@/services/tenantContext');

    async function loadData() {
      try {
        await mockTenantContext.getTenantId();
        const userData = await mockUserService.getCurrentUser();
        setUser(userData);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div role="status">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="error-message" className="p-4">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div data-testid="not-authenticated" className="p-4">
        <h2 className="text-xl font-bold">Not Authenticated</h2>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div data-testid="user-profile" className="p-4">
      <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
      <p>{user.emailAddresses?.[0]?.emailAddress}</p>
    </div>
  );
}
