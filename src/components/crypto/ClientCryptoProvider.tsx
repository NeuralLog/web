'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { KeyHierarchy } from '@neurallog/sdk';

interface ClientCryptoContextType {
  keyHierarchy: KeyHierarchy | null;
  tenantId: string;
  isInitialized: boolean;
  initializeKeyHierarchy: (masterSecret?: string, tenantId?: string) => void;
  decryptLogEntry: (encryptedData: any, logName: string) => Promise<any>;
}

const ClientCryptoContext = createContext<ClientCryptoContextType>({
  keyHierarchy: null,
  tenantId: 'default',
  isInitialized: false,
  initializeKeyHierarchy: () => {},
  decryptLogEntry: async () => ({}),
});

export const ClientCryptoProvider: React.FC<{
  children: React.ReactNode;
  initialTenantId?: string;
}> = ({ children, initialTenantId = 'default' }) => {
  const [keyHierarchy, setKeyHierarchy] = useState<KeyHierarchy | null>(null);
  const [tenantId, setTenantId] = useState<string>(initialTenantId);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const initializeKeyHierarchy = (masterSecret?: string, newTenantId?: string) => {
    try {
      // Use provided tenant ID or keep the current one
      const effectiveTenantId = newTenantId || tenantId;
      
      // Create a new key hierarchy
      const newKeyHierarchy = new KeyHierarchy(masterSecret);
      
      // Update state
      setKeyHierarchy(newKeyHierarchy);
      setTenantId(effectiveTenantId);
      setIsInitialized(true);
      
      // Store in localStorage for persistence
      if (masterSecret) {
        localStorage.setItem('masterSecret', masterSecret);
      }
      localStorage.setItem('tenantId', effectiveTenantId);
      
      console.log('Key hierarchy initialized for tenant:', effectiveTenantId);
    } catch (error) {
      console.error('Error initializing key hierarchy:', error);
    }
  };

  const decryptLogEntry = async (encryptedData: any, logName: string): Promise<any> => {
    if (!keyHierarchy) {
      throw new Error('Key hierarchy not initialized');
    }
    
    try {
      // Check if data is encrypted
      if (!encryptedData.encrypted) {
        return encryptedData.data;
      }
      
      // Import decryption function
      const { decryptLogEntry } = await import('@neurallog/sdk');
      
      // Derive encryption key for this log
      const encryptionKey = await keyHierarchy.deriveLogEncryptionKey(tenantId, logName);
      
      // Decrypt the log data
      const decryptedData = await decryptLogEntry(encryptedData.data, encryptionKey);
      
      return decryptedData;
    } catch (error) {
      console.error('Error decrypting log entry:', error);
      return encryptedData.data;
    }
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedMasterSecret = localStorage.getItem('masterSecret');
    const storedTenantId = localStorage.getItem('tenantId');
    
    if (storedMasterSecret) {
      initializeKeyHierarchy(storedMasterSecret, storedTenantId || initialTenantId);
    }
  }, [initialTenantId]);

  return (
    <ClientCryptoContext.Provider
      value={{
        keyHierarchy,
        tenantId,
        isInitialized,
        initializeKeyHierarchy,
        decryptLogEntry,
      }}
    >
      {children}
    </ClientCryptoContext.Provider>
  );
};

export const useClientCrypto = () => useContext(ClientCryptoContext);
