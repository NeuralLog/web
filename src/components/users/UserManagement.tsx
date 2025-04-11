/**
 * User Management Component
 *
 * This component provides a UI for managing users in a tenant.
 */

'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { getUsersByTenant, addUserToTenant, removeUserFromTenant } from '@/services/userService';
import { getTenantId } from '@/services/tenantContext';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddresses: { emailAddress: string }[];
  imageUrl?: string;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Simple toast function
  const showToast = (title: string, description: string, status: 'success' | 'error' | 'warning' = 'success') => {
    // In a real app, you would implement a toast notification system
    console.log(`${status.toUpperCase()}: ${title} - ${description}`);
    // For now, we'll just use alert for demonstration
    alert(`${title}: ${description}`);
  };

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  // Load users when the component mounts
  useEffect(() => {
    async function loadData() {
      try {
        const tenant = await getTenantId();
        setTenantId(tenant);
        await loadUsers(tenant);
      } catch (error) {
        console.error('Failed to load tenant ID:', error);
        showToast('Error', 'Failed to load tenant information', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Load users for a tenant
  async function loadUsers(tenant: string) {
    try {
      setLoading(true);
      const tenantUsers = await getUsersByTenant(tenant);
      setUsers(tenantUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast('Error', 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Handle adding a user to the tenant
  async function handleAddUser() {
    try {
      // In a real implementation, we would look up the user by email
      // For now, we'll just create a mock user
      const userId = `user_${Date.now()}`;
      await addUserToTenant(userId, tenantId, isAdmin);

      // Reload the users
      await loadUsers(tenantId);

      // Close the modal and reset the form
      onClose();
      setEmail('');
      setIsAdmin(false);

      showToast('Success', 'User added to tenant', 'success');
    } catch (error) {
      console.error('Failed to add user:', error);
      showToast('Error', 'Failed to add user to tenant', 'error');
    }
  }

  // Handle removing a user from the tenant
  async function handleRemoveUser(user: User) {
    try {
      await removeUserFromTenant(user.id, tenantId);

      // Reload the users
      await loadUsers(tenantId);

      showToast('Success', 'User removed from tenant', 'success');
    } catch (error) {
      console.error('Failed to remove user:', error);
      showToast('Error', 'Failed to remove user from tenant', 'error');
    }
  }

  // Handle editing a user's role
  function handleEditUser(user: User) {
    setSelectedUser(user);
    setIsAdmin(false); // Reset the admin checkbox
    onOpen();
  }

  // Handle updating a user's role
  async function handleUpdateUser() {
    if (!selectedUser) return;

    try {
      // First remove the user from the tenant
      await removeUserFromTenant(selectedUser.id, tenantId);

      // Then add them back with the updated role
      await addUserToTenant(selectedUser.id, tenantId, isAdmin);

      // Reload the users
      await loadUsers(tenantId);

      // Close the modal and reset the form
      onClose();
      setSelectedUser(null);
      setIsAdmin(false);

      showToast('Success', 'User role updated', 'success');
    } catch (error) {
      console.error('Failed to update user role:', error);
      showToast('Error', 'Failed to update user role', 'error');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"
          data-testid="loading-spinner"
        ></div>
      </div>
    );
  }

  return (
    <div data-testid="user-management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button
          variant="default"
          onClick={() => {
            setSelectedUser(null);
            setEmail('');
            setIsAdmin(false);
            onOpen();
          }}
          data-testid="add-user-button"
        >
          + Add User
        </Button>
      </div>

      {users.length === 0 ? (
        <p>No users found in this tenant.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" data-testid="users-table">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} data-testid={`user-row-${user.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mr-2">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.emailAddresses[0]?.emailAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Member
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleEditUser(user)}
                      data-testid={`edit-user-${user.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveUser(user)}
                      data-testid={`remove-user-${user.id}`}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {selectedUser ? 'Edit User Role' : 'Add User to Tenant'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="mt-4">
                    {selectedUser ? (
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mr-3">
                            {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold">
                              {selectedUser.firstName} {selectedUser.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedUser.emailAddresses[0]?.emailAddress}
                            </p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <div className="flex items-center">
                            <Checkbox
                              id="admin-checkbox"
                              checked={isAdmin}
                              onCheckedChange={(checked) => setIsAdmin(checked === true)}
                              data-testid="admin-checkbox"
                            />
                            <label htmlFor="admin-checkbox" className="ml-2 text-sm text-gray-700">
                              Admin
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            data-testid="email-input"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <div className="flex items-center">
                            <Checkbox
                              id="admin-checkbox"
                              checked={isAdmin}
                              onCheckedChange={(checked) => setIsAdmin(checked === true)}
                              data-testid="admin-checkbox"
                            />
                            <label htmlFor="admin-checkbox" className="ml-2 text-sm text-gray-700">
                              Admin
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={selectedUser ? handleUpdateUser : handleAddUser}
                      data-testid="save-user-button"
                    >
                      {selectedUser ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
