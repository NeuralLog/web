import { describe, it, expect } from '@jest/globals';
import { render, screen } from '../../../test-utils';
import React from 'react';
import '@testing-library/jest-dom';
import { UserProfileUI } from '../UserProfileSimplified';

// Mock user data
const mockUser = {
  id: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john@example.com' }],
  imageUrl: 'https://via.placeholder.com/150',
  createdAt: '2023-01-01T00:00:00.000Z'
};

describe('UserProfileUI Component', () => {
  it('should render loading state', () => {
    render(
      <UserProfileUI
        user={null}
        tenantId={null}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
  });

  it('should render user profile when data is loaded', () => {
    render(
      <UserProfileUI
        user={mockUser}
        tenantId='test-tenant'
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Tenant: test-tenant')).toBeInTheDocument();
  });

  it('should render not authenticated message when user is null', () => {
    render(
      <UserProfileUI
        user={null}
        tenantId='test-tenant'
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to view your profile.')).toBeInTheDocument();
  });

  it('should render error message when there is an error', () => {
    render(
      <UserProfileUI
        user={null}
        tenantId={null}
        loading={false}
        error={new Error('Failed to load user data')}
      />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
  });
});
