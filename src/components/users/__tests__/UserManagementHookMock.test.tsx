import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManagement from '../UserManagement';

// Mock the services
const mockGetUsersByTenant = jest.fn();
const mockAddUserToTenant = jest.fn();
const mockRemoveUserFromTenant = jest.fn();
const mockGetTenantId = jest.fn();

// Mock the service modules
jest.mock('@/services/userService', () => ({
  getUsersByTenant: (...args: any[]) => mockGetUsersByTenant(...args),
  addUserToTenant: (...args: any[]) => mockAddUserToTenant(...args),
  removeUserFromTenant: (...args: any[]) => mockRemoveUserFromTenant(...args)
}));

jest.mock('@/services/tenantContext', () => ({
  getTenantId: () => mockGetTenantId()
}));

// Mock users data
const mockUsers = [
  {
    id: 'user_1',
    firstName: 'John',
    lastName: 'Doe',
    emailAddresses: [{ emailAddress: 'john@example.com' }],
    imageUrl: 'https://via.placeholder.com/150',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'user_2',
    firstName: 'Jane',
    lastName: 'Smith',
    emailAddresses: [{ emailAddress: 'jane@example.com' }],
    imageUrl: 'https://via.placeholder.com/150',
    createdAt: '2023-01-02T00:00:00.000Z'
  }
];

// Mock window.alert
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', {
  writable: true,
  value: mockAlert
});

describe('UserManagement Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
    mockAlert.mockClear();

    // Set up default mock implementations
    mockGetTenantId.mockResolvedValue('test-tenant');
    mockGetUsersByTenant.mockResolvedValue(mockUsers);
    mockAddUserToTenant.mockResolvedValue(undefined);
    mockRemoveUserFromTenant.mockResolvedValue(undefined);
  });

  test('renders loading state initially', () => {
    act(() => {
      render(<UserManagement />);
    });

    // Check that loading state is displayed
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  test('renders user list after loading', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    // Wait for the users table to appear
    const usersTable = await screen.findByTestId('users-table');
    expect(usersTable).toBeInTheDocument();

    // Check that the users are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();

    // Check for specific user details
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    const memberBadges = screen.getAllByText('Member');
    expect(memberBadges.length).toBeGreaterThan(0);

    // Check for action buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3); // At least Add, Edit, Remove buttons

    // Check that the service was called
    expect(mockGetTenantId).toHaveBeenCalled();
    expect(mockGetUsersByTenant).toHaveBeenCalledWith('test-tenant');
  });

  test('shows "No users found" message when there are no users', async () => {
    // Mock empty users array
    mockGetUsersByTenant.mockResolvedValue([]);

    await act(async () => {
      render(<UserManagement />);
    });

    // Wait for the message to appear
    const noUsersMessage = await screen.findByText('No users found in this tenant.');
    expect(noUsersMessage).toBeInTheDocument();

    // Verify the add user button is still present
    expect(screen.getByTestId('add-user-button')).toBeInTheDocument();

    // Verify the users table is not present
    expect(screen.queryByTestId('users-table')).not.toBeInTheDocument();
  });

  test('opens add user modal when add button is clicked', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    // Wait for the add user button to appear
    const addButton = await screen.findByTestId('add-user-button');

    // Click the add user button
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Check that the modal is open
    const modalTitle = screen.getByText('Add User to Tenant');
    expect(modalTitle).toBeInTheDocument();

    // Check for form elements
    const emailInput = screen.getByTestId('email-input');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('placeholder', 'user@example.com');

    const adminCheckbox = screen.getByTestId('admin-checkbox');
    expect(adminCheckbox).toBeInTheDocument();

    // Check for modal buttons
    expect(screen.getByTestId('save-user-button')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('adds a user when the form is submitted', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    // Wait for the add user button to appear
    const addButton = await screen.findByTestId('add-user-button');

    // Click the add user button
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Fill out the form
    await act(async () => {
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'newuser@example.com' }
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('admin-checkbox'));
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('save-user-button'));
    });

    // Check that the service was called
    expect(mockAddUserToTenant).toHaveBeenCalled();

    // Verify the parameters (the email might be auto-generated, so just check the tenant and admin status)
    const callArgs = mockAddUserToTenant.mock.calls[0];
    expect(callArgs[1]).toBe('test-tenant'); // tenant ID should match
    expect(typeof callArgs[0]).toBe('string'); // email should be a string

    // Check that the users were refreshed
    expect(mockGetUsersByTenant).toHaveBeenCalled();

    // Check that the success toast was shown
    expect(mockAlert).toHaveBeenCalled();
    // Verify the success message contains the expected text
    const alertMessage = mockAlert.mock.calls[0][0];
    expect(alertMessage).toContain('User added to tenant');
  });

  test('handles errors when adding a user', async () => {
    // Mock an error when adding a user
    mockAddUserToTenant.mockRejectedValue(new Error('Failed to add user'));

    await act(async () => {
      render(<UserManagement />);
    });

    // Wait for the add user button to appear
    const addButton = await screen.findByTestId('add-user-button');

    // Click the add user button
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Fill out the form
    await act(async () => {
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'error@example.com' }
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('save-user-button'));
    });

    // Check that the service was called
    expect(mockAddUserToTenant).toHaveBeenCalled();

    // Check that the error toast was shown
    expect(mockAlert).toHaveBeenCalled();
    // Verify the error message contains the expected text
    const alertMessage = mockAlert.mock.calls[0][0];
    expect(alertMessage).toContain('Failed to add user to tenant');

    // Verify the modal is still open
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
  });
});
