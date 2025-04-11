import React from 'react';
import { render, screen } from '../../../test-utils';
import { TenantInfo } from '../TenantInfo';
import { useApp } from '@/hooks/useApp';

// Mock the useApp hook
jest.mock('@/hooks/useApp', () => ({
  useApp: jest.fn(),
}));

// No need to mock UI components anymore

describe('TenantInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    // Arrange
    (useApp as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      user: { firstName: 'Test', lastName: 'User' },
      isLoading: true,
      hasAccess: null,
      error: null,
      isTenantLoading: false,
      tenantError: null,
      accessError: null,
    });

    // Act
    render(<TenantInfo />);

    // Assert
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('should display tenant and user information', () => {
    // Arrange
    (useApp as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      user: { firstName: 'Test', lastName: 'User' },
      isLoading: false,
      hasAccess: true,
      error: null,
      isTenantLoading: false,
      tenantError: null,
      accessError: null,
    });

    // Act
    render(<TenantInfo />);

    // Assert
    expect(screen.getByText('Tenant Information')).toBeInTheDocument();
    expect(screen.getByText('test-tenant')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Has Access')).toBeInTheDocument();
  });

  it('should handle case when no tenant is selected', () => {
    // Arrange
    (useApp as jest.Mock).mockReturnValue({
      tenantId: null,
      user: { firstName: 'Test', lastName: 'User' },
      isLoading: false,
      hasAccess: null,
      error: null,
      isTenantLoading: false,
      tenantError: null,
      accessError: null,
    });

    // Act
    render(<TenantInfo />);

    // Assert
    expect(screen.getByText('No tenant selected')).toBeInTheDocument();
  });

  it('should handle case when user is not authenticated', () => {
    // Arrange
    (useApp as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      user: null,
      isLoading: false,
      hasAccess: null,
      error: null,
      isTenantLoading: false,
      tenantError: null,
      accessError: null,
    });

    // Act
    render(<TenantInfo />);

    // Assert
    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
  });

  it('should show when user does not have access', () => {
    // Arrange
    (useApp as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      user: { firstName: 'Test', lastName: 'User' },
      isLoading: false,
      hasAccess: false,
      error: null,
      isTenantLoading: false,
      tenantError: null,
      accessError: null,
    });

    // Act
    render(<TenantInfo />);

    // Assert
    expect(screen.getByText('No Access')).toBeInTheDocument();
  });

  it('should show error state', () => {
    // Arrange
    const error = new Error('Test error');
    (useApp as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      user: { firstName: 'Test', lastName: 'User' },
      isLoading: false,
      hasAccess: null,
      error: error,
      isTenantLoading: false,
      tenantError: null,
      accessError: null,
    });

    // Act
    render(<TenantInfo />);

    // Assert
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should show tenant loading state', () => {
    // Arrange
    (useApp as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      user: { firstName: 'Test', lastName: 'User' },
      isLoading: false,
      hasAccess: true,
      error: null,
      isTenantLoading: true,
      tenantError: null,
      accessError: null,
    });

    // Act
    render(<TenantInfo />);

    // Assert
    expect(screen.getByText('test-tenant')).toBeInTheDocument();
    // Should have a spinner next to the tenant ID
    expect(screen.getByText('Tenant ID:')).toBeInTheDocument();
  });
});
