import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../UserProfile';
import { UserProfileData } from '@/hooks/useUserProfile';

// Mock the useUserProfile hook
jest.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: jest.fn()
}));

// Import the mocked hook
import { useUserProfile } from '@/hooks/useUserProfile';

// Mock user data
const mockUser = {
  id: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john@example.com' }],
  imageUrl: 'https://via.placeholder.com/150',
  createdAt: '2023-01-01T00:00:00.000Z'
};

describe('UserProfile with Mocked Hook', () => {
  // Cast the imported hook to a jest.Mock to access mock methods
  const mockHook = useUserProfile as jest.Mock;

  beforeEach(() => {
    // Reset the mock before each test
    mockHook.mockReset();
  });

  test('renders loading state', () => {
    // Set up the mock to return loading state
    mockHook.mockReturnValue({
      loading: true,
      user: null,
      tenantId: null,
      error: null
    } as UserProfileData);

    render(<UserProfile />);

    // Verify loading state is displayed
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
  });

  test('renders user profile when data is loaded', () => {
    // Set up the mock to return loaded data
    mockHook.mockReturnValue({
      loading: false,
      user: mockUser,
      tenantId: 'test-tenant',
      error: null
    } as UserProfileData);

    render(<UserProfile />);

    // Verify user data is displayed
    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/Doe/)).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Tenant:')).toBeInTheDocument();
    expect(screen.getByText('test-tenant')).toBeInTheDocument();
    expect(screen.getByText('user_123')).toBeInTheDocument();
    // Date formatting can vary by timezone, so use a more flexible matcher
    expect(screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeInTheDocument();
  });

  test('renders not authenticated message when user is null', () => {
    // Set up the mock to return null user
    mockHook.mockReturnValue({
      loading: false,
      user: null,
      tenantId: 'test-tenant',
      error: null
    } as UserProfileData);

    render(<UserProfile />);

    // Verify not authenticated message is displayed
    expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to view your profile.')).toBeInTheDocument();
  });

  test('handles error state', () => {
    // Set up the mock to return error state
    mockHook.mockReturnValue({
      loading: false,
      user: null,
      tenantId: null,
      error: new Error('Failed to load user data')
    } as UserProfileData);

    render(<UserProfile />);

    // Verify not authenticated message is displayed (since there's no specific error UI)
    expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
  });
});
