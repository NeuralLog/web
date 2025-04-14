'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from './CryptoProvider';

interface EncryptionSettingsProps {
  onClose?: () => void;
}

export const EncryptionSettings: React.FC<EncryptionSettingsProps> = ({ onClose }) => {
  const { isInitialized, initializeKeyHierarchy, tenantId } = useCrypto();
  const [masterSecret, setMasterSecret] = useState<string>('');
  const [newTenantId, setNewTenantId] = useState<string>(tenantId);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Load stored master secret if available
    const storedMasterSecret = localStorage.getItem('neurallog_master_secret');
    if (storedMasterSecret) {
      setMasterSecret(storedMasterSecret);
    }
    
    // Load stored tenant ID if available
    const storedTenantId = localStorage.getItem('neurallog_tenant_id');
    if (storedTenantId) {
      setNewTenantId(storedTenantId);
    }
  }, []);

  const handleSave = () => {
    try {
      // Initialize key hierarchy with provided master secret and tenant ID
      initializeKeyHierarchy(masterSecret || undefined, newTenantId);
      
      setMessage('Encryption settings saved successfully');
      
      // Close the dialog if a callback is provided
      if (onClose) {
        setTimeout(onClose, 1500);
      }
    } catch (error) {
      console.error('Error saving encryption settings:', error);
      setMessage('Error saving encryption settings');
    }
  };

  const generateNewSecret = () => {
    try {
      // Import the generateEncryptionKey function
      import('@neurallog/sdk').then(({ generateEncryptionKey, arrayBufferToBase64 }) => {
        // Generate a new random encryption key
        const newKey = generateEncryptionKey();
        
        // Convert to Base64 string
        const base64Key = arrayBufferToBase64(newKey);
        
        // Set as master secret
        setMasterSecret(base64Key);
        
        setMessage('New master secret generated');
      });
    } catch (error) {
      console.error('Error generating new master secret:', error);
      setMessage('Error generating new master secret');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Encryption Settings
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tenant ID
        </label>
        <input
          type="text"
          value={newTenantId}
          onChange={(e) => setNewTenantId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="default"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Master Secret
        </label>
        <div className="flex">
          <input
            type={showSecret ? 'text' : 'password'}
            value={masterSecret}
            onChange={(e) => setMasterSecret(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter master secret or generate a new one"
          />
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="px-3 py-2 border border-l-0 border-gray-300 bg-gray-100 dark:bg-gray-700 rounded-r-md"
          >
            {showSecret ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between mb-4">
        <button
          type="button"
          onClick={generateNewSecret}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Generate New Secret
        </button>
        
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Settings
        </button>
      </div>
      
      {message && (
        <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md text-center">
          {message}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-2">
          <strong>Status:</strong> {isInitialized ? 'Encryption is active' : 'Encryption is not configured'}
        </p>
        <p className="mb-2">
          <strong>Note:</strong> The master secret is used to derive encryption keys for all logs. Keep it secure!
        </p>
        <p>
          <strong>Warning:</strong> Changing the master secret will make previously encrypted logs unreadable.
        </p>
      </div>
    </div>
  );
};

export default EncryptionSettings;
