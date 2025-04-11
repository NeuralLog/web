import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// Mock user data
const mockUser = {
  id: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john@example.com' }],
  imageUrl: 'https://via.placeholder.com/150',
  createdAt: '2023-01-01T00:00:00.000Z'
};

describe('UserProfile Component', () => {
  // Reset modules before each test
  beforeEach(() => {
    jest.resetModules();
  });

  it('should render loading state', () => {
    // Mock the hook for this test
    jest.doMock('@/hooks/useUserProfile', () => ({
      useUserProfile: () => ({
        user: null,
        tenantId: null,
        loading: true,
        error: null
      })
    }));

    // Import the component after mocking
    const UserProfile = require('../UserProfile').default;

    render(<UserProfile />);

    // Check that loading state is displayed
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
  });

  it('should render user profile when data is loaded', () => {
    // Mock the hook for this test
    jest.doMock('@/hooks/useUserProfile', () => ({
      useUserProfile: () => ({
        user: mockUser,
        tenantId: 'test-tenant',
        loading: false,
        error: null
      })
    }));

    // Import the component after mocking
    const UserProfile = require('../UserProfile').default;

    render(<UserProfile />);

    // Check that user profile is displayed
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('test-tenant')).toBeInTheDocument();
  });

  it('should render not authenticated message when user is null', () => {
    // Mock the hook for this test
    jest.doMock('@/hooks/useUserProfile', () => ({
      useUserProfile: () => ({
        user: null,
        tenantId: 'test-tenant',
        loading: false,
        error: null
      })
    }));

    // Import the component after mocking
    const UserProfile = require('../UserProfile').default;

    render(<UserProfile />);

    // Check that not authenticated message is displayed
    expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to view your profile.')).toBeInTheDocument();
  });
});
