import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { UserProvider, useUserContext } from '../UserProvider';
import { getCurrentUser } from '@/services/userService';

// Mock the user service
jest.mock('@/services/userService', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock component that uses the user context
const TestComponent = () => {
  const { user, isLoading } = useUserContext();
  
  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  
  return <div data-testid="user-info">{user ? user.firstName : 'No user'}</div>;
};

describe('UserProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should show loading state initially', () => {
    // Arrange
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    
    // Act
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Assert
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
  });
  
  it('should provide user information when loaded', async () => {
    // Arrange
    const mockUser = { id: 'user_123', firstName: 'Test', lastName: 'User' };
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    // Act
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Wait for user to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Assert
    expect(screen.getByTestId('user-info')).toHaveTextContent('Test');
  });
  
  it('should handle case when no user is authenticated', async () => {
    // Arrange
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    
    // Act
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Wait for user to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Assert
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
  });
});
