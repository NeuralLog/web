'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { KeyHierarchy, generateEncryptionKey } from '@neurallog/sdk';

interface CryptoContextType {
  keyHierarchy: KeyHierarchy | null;
  tenantId: string;
  isInitialized: boolean;
  initializeKeyHierarchy: (masterSecret?: string, tenantId?: string) => void;
  encryptData: (data: any, logName: string) => Promise<any>;
  decryptData: (encryptedData: any, logName: string) => Promise<any>;
}

const CryptoContext = createContext<CryptoContextType>({
  keyHierarchy: null,
  tenantId: 'default',
  isInitialized: false,
  initializeKeyHierarchy: () => {},
  encryptData: async () => ({}),
  decryptData: async () => ({}),
});

export const useCrypto = () => useContext(CryptoContext);

interface CryptoProviderProps {
  children: React.ReactNode;
}

export const CryptoProvider: React.FC<CryptoProviderProps> = ({ children }) => {
  const [keyHierarchy, setKeyHierarchy] = useState<KeyHierarchy | null>(null);
  const [tenantId, setTenantId] = useState<string>('default');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize from localStorage if available
  useEffect(() => {
    const storedMasterSecret = localStorage.getItem('neurallog_master_secret');
    const storedTenantId = localStorage.getItem('neurallog_tenant_id');
    
    if (storedMasterSecret) {
      initializeKeyHierarchy(storedMasterSecret, storedTenantId || 'default');
    }
  }, []);

  const initializeKeyHierarchy = (masterSecret?: string, newTenantId?: string) => {
    try {
      // Generate a random master secret if not provided
      const secret = masterSecret || arrayBufferToBase64(generateEncryptionKey());
      const tenant = newTenantId || tenantId;
      
      // Create a new key hierarchy
      const hierarchy = new KeyHierarchy(secret);
      
      // Store in state
      setKeyHierarchy(hierarchy);
      setTenantId(tenant);
      setIsInitialized(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('neurallog_master_secret', secret);
      localStorage.setItem('neurallog_tenant_id', tenant);
      
      console.log('Key hierarchy initialized successfully');
    } catch (error) {
      console.error('Error initializing key hierarchy:', error);
    }
  };

  const encryptData = async (data: any, logName: string): Promise<any> => {
    if (!keyHierarchy) {
      throw new Error('Key hierarchy not initialized');
    }
    
    try {
      // Import encryption functions
      const { encryptLogEntry, generateSearchTokens } = await import('@neurallog/sdk');
      
      // Derive encryption key for this log
      const encryptionKey = await keyHierarchy.deriveLogEncryptionKey(tenantId, logName);
      
      // Encrypt the log data
      const encryptedData = await encryptLogEntry(data, encryptionKey);
      
      // Derive search key for this log
      const searchKey = await keyHierarchy.deriveLogSearchKey(tenantId, logName);
      
      // Generate search tokens
      const searchTokens = await generateSearchTokens(data, searchKey, tenantId);
      
      return {
        encryptionOptions: {
          encrypted: true,
          encryptedData,
          searchTokens
        }
      };
    } catch (error) {
      console.error('Error encrypting data:', error);
      return { data };
    }
  };

  const decryptData = async (encryptedData: any, logName: string): Promise<any> => {
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
      console.error('Error decrypting data:', error);
      return encryptedData.data;
    }
  };

  return (
    <CryptoContext.Provider
      value={{
        keyHierarchy,
        tenantId,
        isInitialized,
        initializeKeyHierarchy,
        encryptData,
        decryptData
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};

// Utility function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
