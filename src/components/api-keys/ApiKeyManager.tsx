/**
 * API key manager component
 */

import React, { useState, useEffect } from 'react';
import { useNeuralLogContext } from '../../contexts/NeuralLogContext';

/**
 * API key
 */
interface ApiKey {
  /**
   * API key ID
   */
  id: string;
  
  /**
   * API key name
   */
  name: string;
  
  /**
   * API key scopes
   */
  scopes: string[];
  
  /**
   * When the API key was created
   */
  createdAt: string;
  
  /**
   * When the API key was last used
   */
  lastUsedAt: string | null;
  
  /**
   * When the API key expires
   */
  expiresAt: string | null;
}

/**
 * API key manager component
 * 
 * @returns Component JSX
 */
export function ApiKeyManager(): JSX.Element {
  const { listApiKeys, createApiKey, revokeApiKey } = useNeuralLogContext();
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['logs:read', 'logs:write']);
  
  // Available scopes
  const availableScopes = [
    { value: 'logs:read', label: 'Read Logs' },
    { value: 'logs:write', label: 'Write Logs' },
    { value: 'logs:admin', label: 'Manage Logs' },
    { value: 'users:read', label: 'Read Users' },
    { value: 'users:write', label: 'Manage Users' }
  ];
  
  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, []);
  
  /**
   * Load API keys
   */
  const loadApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const keys = await listApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setError('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle creating a new API key
   */
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyName) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const apiKey = await createApiKey(newKeyName, selectedScopes);
      setNewKey(apiKey);
      setNewKeyName('');
      
      // Reload API keys
      await loadApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      setError('Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle revoking an API key
   */
  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await revokeApiKey(keyId);
      
      // Reload API keys
      await loadApiKeys();
    } catch (error) {
      console.error('Error revoking API key:', error);
      setError('Failed to revoke API key');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle scope selection
   */
  const handleScopeChange = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };
  
  /**
   * Format date
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'Never';
    }
    
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">API Keys</h2>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* New API key */}
      {newKey && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">API Key Created</p>
          <p className="text-sm">Please copy your API key now. It will not be shown again.</p>
          <div className="mt-2 p-2 bg-gray-100 rounded break-all">
            <code>{newKey}</code>
          </div>
          <button
            className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
            onClick={() => {
              navigator.clipboard.writeText(newKey);
              alert('API key copied to clipboard');
            }}
          >
            Copy to Clipboard
          </button>
          <button
            className="mt-2 ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-sm"
            onClick={() => setNewKey(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Create API key form */}
      <form onSubmit={handleCreateApiKey} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="keyName">
            API Key Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="keyName"
            type="text"
            placeholder="My API Key"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Scopes
          </label>
          <div className="flex flex-wrap">
            {availableScopes.map((scope) => (
              <div key={scope.value} className="mr-4 mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={selectedScopes.includes(scope.value)}
                    onChange={() => handleScopeChange(scope.value)}
                  />
                  <span className="ml-2 text-gray-700">{scope.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          disabled={isLoading || !newKeyName}
        >
          {isLoading ? 'Creating...' : 'Create API Key'}
        </button>
      </form>
      
      {/* API keys list */}
      <div>
        <h3 className="text-xl font-bold mb-4">Your API Keys</h3>
        
        {isLoading ? (
          <p>Loading API keys...</p>
        ) : apiKeys.length === 0 ? (
          <p>You don't have any API keys yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Scopes
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {key.name}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {key.scopes.join(', ')}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {formatDate(key.lastUsedAt)}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                        onClick={() => handleRevokeApiKey(key.id)}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
