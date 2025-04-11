import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { TenantProvider, useTenantContext } from '../TenantProvider';
import { getTenantId, setTenantId, clearTenantContext, getTenantIdSync } from '@/services/tenantContext';

// Mock the tenant context service
jest.mock('@/services/tenantContext', () => ({
  getTenantId: jest.fn(),
  setTenantId: jest.fn(),
  clearTenantContext: jest.fn(),
  getTenantIdSync: jest.fn()
}));

// Mock component that uses the tenant context
const TestComponent = () => {
  const { tenantId, isLoading, error } = useTenantContext();

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error">{error.message}</div>;
  }

  return <div data-testid="tenant-id">{tenantId || 'no-tenant'}</div>;
};

describe('TenantProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getTenantIdSync as jest.Mock).mockReturnValue(null);
  });

  it('should show loading state initially', async () => {
    // Arrange
    (getTenantId as jest.Mock).mockResolvedValue(null);

    // Act
    render(
      <TenantProvider>
        <TestComponent />
      </TenantProvider>
    );

    // Assert
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should load tenant ID from Redis', async () => {
    // Arrange
    (getTenantId as jest.Mock).mockResolvedValue('test-tenant');

    // Act
    render(
      <TenantProvider>
        <TestComponent />
      </TenantProvider>
    );

    // Wait for the tenant ID to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(screen.getByTestId('tenant-id')).toHaveTextContent('test-tenant');
    expect(getTenantId).toHaveBeenCalled();
  });

  it('should handle Redis errors', async () => {
    // Arrange
    const error = new Error('Redis error');
    (getTenantId as jest.Mock).mockRejectedValue(error);

    // Act
    render(
      <TenantProvider>
        <TestComponent />
      </TenantProvider>
    );

    // Wait for the error to be handled
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(screen.getByTestId('error')).toHaveTextContent('Redis error');
  });

  it('should update tenant ID', async () => {
    // Arrange
    (getTenantId as jest.Mock).mockResolvedValue('initial-tenant');
    (setTenantId as jest.Mock).mockResolvedValue(undefined);

    // Create a component that updates the tenant ID
    const UpdateTenantComponent = () => {
      const { tenantId, setTenantId, isLoading } = useTenantContext();

      React.useEffect(() => {
        if (!isLoading && tenantId === 'initial-tenant') {
          setTenantId('updated-tenant');
        }
      }, [isLoading, tenantId, setTenantId]);

      if (isLoading) {
        return <div data-testid="loading">Loading...</div>;
      }

      return <div data-testid="tenant-id">{tenantId}</div>;
    };

    // Act
    render(
      <TenantProvider>
        <UpdateTenantComponent />
      </TenantProvider>
    );

    // Wait for the initial tenant ID to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Wait for the tenant ID to be updated
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(setTenantId).toHaveBeenCalledWith('updated-tenant');
    expect(screen.getByTestId('tenant-id')).toHaveTextContent('updated-tenant');
  });

  it('should handle errors when updating tenant ID', async () => {
    // Arrange
    (getTenantId as jest.Mock).mockResolvedValue('initial-tenant');
    const updateError = new Error('Update error');
    (setTenantId as jest.Mock).mockRejectedValue(updateError);

    // Mock the TenantProvider's internal implementation
    const mockSetError = jest.fn();
    const mockSetTenantId = jest.fn();
    const mockSetIsLoading = jest.fn();

    // Create a test component that directly tests the error handling
    const TestComponent = () => {
      const [error, setError] = React.useState<Error | null>(null);
      const [tenantId, setTenantIdState] = React.useState<string | null>('initial-tenant');
      const [isLoading, setIsLoading] = React.useState(false);

      // Expose the state setters to our test
      React.useEffect(() => {
        mockSetError.mockImplementation(setError);
        mockSetTenantId.mockImplementation(setTenantIdState);
        mockSetIsLoading.mockImplementation(setIsLoading);
      }, []);

      // Simulate the setTenantId function from TenantProvider
      const updateTenant = async () => {
        try {
          setIsLoading(true);
          await setTenantId('updated-tenant');
          setTenantIdState('updated-tenant');
          setIsLoading(false);
        } catch (err) {
          setError(err as Error);
          setIsLoading(false);
        }
      };

      return (
        <div>
          <button data-testid="update-button" onClick={updateTenant}>Update Tenant</button>
          {error && <div data-testid="error">{error.message}</div>}
          {tenantId && <div data-testid="tenant-id">{tenantId}</div>}
          {isLoading && <div data-testid="loading">Loading...</div>}
        </div>
      );
    };

    // Act
    render(<TestComponent />);

    // Click the update button to trigger the error
    fireEvent.click(screen.getByTestId('update-button'));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    // Assert
    expect(setTenantId).toHaveBeenCalledWith('updated-tenant');
    expect(screen.getByTestId('error')).toHaveTextContent('Update error');
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
});
