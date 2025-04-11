'use client';

import { useState, useEffect } from 'react';
import { ApiKeyList } from '@/components/ApiKeyManagement/ApiKeyList';
import ApiKeyForm from '@/components/ApiKeyForm/ApiKeyForm';
import { ApiKeyDialog } from '@/components/ApiKeyManagement/ApiKeyDialog';
import { ApiKey } from '@/types/apiKey';
import { getApiKeys, createApiKey, revokeApiKey } from '@/services/apiKeyService';
import { useAuth } from '@/context/AuthContext';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const showToast = (title: string, description: string, status: 'success' | 'error') => {
    // In a real app, you would implement a toast notification system
    console.log(`${status.toUpperCase()}: ${title} - ${description}`);
    // For now, we'll just use alert for demonstration
    alert(`${title}: ${description}`);
  };

  // Load API keys on component mount
  useEffect(() => {
    const loadApiKeys = async () => {
      setIsLoading(true);
      try {
        const keys = await getApiKeys();
        setApiKeys(keys);
      } catch (err) {
        console.error('Failed to load API keys', err);
        showToast('Error', 'Failed to load API keys', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKeys();
  }, []);

  const handleCreateApiKey = async (name: string, scopes: string[]) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create the API key using our service with the Auth0 user ID
      const userId = user?.sub;
      const { apiKey, keyData } = await createApiKey(name, scopes, userId);

      // Update state with the new keys from the service
      const keys = await getApiKeys();
      setApiKeys(keys);
      setNewApiKey(apiKey);
      onOpen();
    } catch (err) {
      setError('Failed to create API key. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    try {
      // Revoke the API key using our service
      await revokeApiKey(keyId);

      // Update state with the new keys from the service
      const keys = await getApiKeys();
      setApiKeys(keys);

      // Show success message
      showToast('API key revoked', 'The API key has been successfully revoked.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to revoke API key. Please try again.', 'error');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            API Keys
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage API keys for your NeuralLog integration.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create API Key</h2>
          </div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="p-6">
            <ApiKeyForm
              onSubmit={handleCreateApiKey}
              isSubmitting={isSubmitting}
              error={error}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your API Keys</h2>
          </div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="p-6">
            <ApiKeyList
              apiKeys={apiKeys}
              isLoading={isLoading}
              onRevoke={handleRevokeApiKey}
            />
          </div>
        </div>
      </div>

      <ApiKeyDialog
        isOpen={isOpen}
        apiKey={newApiKey}
        onClose={onClose}
      />
    </div>
  );
}
