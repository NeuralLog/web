'use client'

import { ApiKey } from '@/types/apiKey';
import { Button } from '@/components/ui/Button';

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  isLoading: boolean;
  onRevoke: (keyId: string) => void;
}

export function ApiKeyList({ apiKeys, isLoading, onRevoke }: ApiKeyListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-10" data-testid="api-key-list-loading">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-brand-500 border-r-transparent align-[-0.125em]"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Loading API keys...</p>
      </div>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-10" data-testid="api-key-list-empty">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No API keys found</p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Create your first API key to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="api-key-list">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prefix</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Permissions</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Used</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {apiKeys.map((key) => (
            <tr key={key.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{key.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{key.keyPrefix}...</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{key.scopes.join(', ')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(key.createdAt).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRevoke(key.id)}
                  data-testid={`revoke-button-${key.id}`}
                >
                  Revoke
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
