'use client';

import React from 'react';
import { EncryptionSettings } from '@/components/crypto';
import { useCrypto } from '@/components/crypto';

export default function EncryptionSettingsPage() {
  const { isInitialized } = useCrypto();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Encryption Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Zero-Knowledge Encryption</h2>
        <p className="mb-4">
          NeuralLog supports zero-knowledge encryption, which means your log data is encrypted on the client side
          before being sent to the server. This ensures that only you can read the contents of your logs.
        </p>
        <p className="mb-4">
          When encryption is enabled, log data is encrypted using AES-256-GCM with a key derived from your master secret.
          Search tokens are generated to enable searching encrypted logs without revealing their contents.
        </p>
        <p className="mb-4">
          <strong>Current Status:</strong> {isInitialized ? 'Encryption is active' : 'Encryption is not configured'}
        </p>
      </div>
      
      <div className="mx-auto max-w-md">
        <EncryptionSettings />
      </div>
    </div>
  );
}
