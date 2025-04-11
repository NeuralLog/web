import { renderHook, act } from '@testing-library/react';
import { useApp } from '../useApp';
import { useTenantContext } from '@/providers/TenantProvider';
import { useUserContext } from '@/providers/UserProvider';
import { isUserInTenant } from '@/services/userService';

// Mock the hooks and services
jest.mock('@/providers/TenantProvider', () => ({
  useTenantContext: jest.fn(),
}));

jest.mock('@/providers/UserProvider', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('@/services/userService', () => ({
  isUserInTenant: jest.fn(),
}));

describe('useApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (useTenantContext as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      setTenantId: jest.fn(),
      isLoading: false,
      error: null,
      isTenantLoading: false,
      tenantError: null,
    });

    (useUserContext as jest.Mock).mockReturnValue({
      user: { id: 'user_123', firstName: 'Test' },
      isLoading: false,
      error: null,
      refreshUser: jest.fn(),
    });

    (isUserInTenant as jest.Mock).mockResolvedValue(true);
  });

  it('should return tenant and user context', async () => {
    // Act
    const { result } = renderHook(() => useApp());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.tenantId).toBe('test-tenant');
    expect(result.current.user).toEqual({ id: 'user_123', firstName: 'Test' });
    expect(result.current.isLoading).toBe(false);
  });

  it('should check if user has access to tenant', async () => {
    // Arrange
    (isUserInTenant as jest.Mock).mockResolvedValue(true);

    // Act
    const { result } = renderHook(() => useApp());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.hasAccess).toBe(true);
    expect(isUserInTenant).toHaveBeenCalledWith('user_123', 'test-tenant');
  });

  it('should handle case when user does not have access', async () => {
    // Arrange
    (isUserInTenant as jest.Mock).mockResolvedValue(false);

    // Act
    const { result } = renderHook(() => useApp());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.hasAccess).toBe(false);
  });

  it('should handle case when no user is authenticated', async () => {
    // Arrange
    (useUserContext as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      refreshUser: jest.fn(),
    });

    // Act
    const { result } = renderHook(() => useApp());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.hasAccess).toBeNull();
    expect(isUserInTenant).not.toHaveBeenCalled();
  });

  it('should handle case when no tenant is selected', async () => {
    // Arrange
    (useTenantContext as jest.Mock).mockReturnValue({
      tenantId: null,
      setTenantId: jest.fn(),
      isLoading: false,
      error: null,
      isTenantLoading: false,
      tenantError: null,
    });

    // Act
    const { result } = renderHook(() => useApp());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.hasAccess).toBeNull();
    expect(isUserInTenant).not.toHaveBeenCalled();
  });

  it('should handle errors when checking access', async () => {
    // Arrange
    const error = new Error('Access check error');
    (isUserInTenant as jest.Mock).mockRejectedValue(error);

    // Act
    const { result } = renderHook(() => useApp());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.hasAccess).toBe(false);
    expect(result.current.accessError).toEqual(error);
  });

  it('should combine loading states', async () => {
    // Arrange
    (useTenantContext as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      setTenantId: jest.fn(),
      isLoading: true,
      error: null,
      isTenantLoading: false,
      tenantError: null,
    });

    // Act
    const { result } = renderHook(() => useApp());

    // Assert
    expect(result.current.isLoading).toBe(true);
  });

  it('should combine error states', async () => {
    // Arrange
    const tenantError = new Error('Tenant error');
    (useTenantContext as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      setTenantId: jest.fn(),
      isLoading: false,
      error: tenantError,
      isTenantLoading: false,
      tenantError: null,
    });

    // Act
    const { result } = renderHook(() => useApp());

    // Assert
    expect(result.current.error).toBe(tenantError);
  });
});
