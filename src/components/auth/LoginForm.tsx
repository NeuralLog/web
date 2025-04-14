/**
 * Login form component
 */

import React, { useState } from 'react';
import { useNeuralLogContext } from '../../contexts/NeuralLogContext';

/**
 * Login form props
 */
interface LoginFormProps {
  /**
   * Callback for successful login
   */
  onSuccess?: () => void;
}

/**
 * Login form component
 *
 * @param props Component props
 * @returns Component JSX
 */
export function LoginForm({ onSuccess }: LoginFormProps): JSX.Element {
  const { login, loginWithApiKey, isLoading, error } = useNeuralLogContext();

  const [activeTab, setActiveTab] = useState<'credentials' | 'apiKey'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');

  /**
   * Handle credentials login
   */
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      return;
    }

    try {
      const success = await login(username, password);

      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  /**
   * Handle API key login
   */
  const handleApiKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey) {
      return;
    }

    try {
      const success = await loginWithApiKey(apiKey);

      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('API key login error:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Log In to NeuralLog</h2>

      {/* Tab navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${
            activeTab === 'credentials'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('credentials')}
        >
          Username & Password
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'apiKey'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('apiKey')}
        >
          API Key
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Credentials form */}
      {activeTab === 'credentials' && (
        <form onSubmit={handleCredentialsLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
      )}

      {/* API key form */}
      {activeTab === 'apiKey' && (
        <form onSubmit={handleApiKeyLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiKey">
              API Key
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="apiKey"
              type="text"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
