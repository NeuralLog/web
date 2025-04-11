import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManagement from '../UserManagement';
import React from 'react';

// Mock the services
jest.mock('@/services/userService', () => ({
  getUsersByTenant: jest.fn().mockResolvedValue([]),
  addUserToTenant: jest.fn(),
  removeUserFromTenant: jest.fn()
}));

jest.mock('@/services/tenantContext', () => ({
  getTenantId: jest.fn().mockResolvedValue('test-tenant')
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="mock-toaster" />
}));

describe('UserManagement Simple Tests', () => {
  it('should render the component', () => {
    render(<UserManagement />);

    // The component should render without errors
    // Look for the loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
