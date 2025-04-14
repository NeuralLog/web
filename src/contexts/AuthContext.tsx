import React, { createContext, useContext, useState, useEffect } from 'react';
import { NeuralLogClient, NeuralLogClientConfig } from '@neurallog/typescript-client-sdk';
import { useConfig } from '../hooks/useConfig';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any | null;
  client: NeuralLogClient | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeWithRecoveryPhrase: (recoveryPhrase: string) => Promise<boolean>;
  initializeWithMnemonic: (mnemonicPhrase: string) => Promise<boolean>;
  generateMnemonic: (strength?: number) => string;
  generateMnemonicQuiz: (mnemonic: string, numQuestions?: number) => Array<{ index: number; word: string }>;
  verifyMnemonicQuiz: (mnemonic: string, answers: Array<{ index: number; word: string }>) => boolean;
  recoverKEKVersions: (versions: string[]) => Promise<boolean>;
  provisionKEKForUser: (userId: string, kekVersionId: string) => Promise<void>;
  splitKEKIntoShares: (numShares: number, threshold: number) => Promise<any[]>;
  reconstructKEKFromShares: (shares: any[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  client: null,
  login: async () => false,
  logout: () => {},
  initializeWithRecoveryPhrase: async () => false,
  initializeWithMnemonic: async () => false,
  generateMnemonic: () => '',
  generateMnemonicQuiz: () => [],
  verifyMnemonicQuiz: () => false,
  recoverKEKVersions: async () => false,
  provisionKEKForUser: async () => {},
  splitKEKIntoShares: async () => [],
  reconstructKEKFromShares: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUrl, logsUrl, tenantId, registryUrl } = useConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [client, setClient] = useState<NeuralLogClient | null>(null);

  // Initialize client
  useEffect(() => {
    const initClient = () => {
      const config: NeuralLogClientConfig = {
        tenantId,
        authUrl,
        apiUrl: logsUrl,
        registryUrl
      };

      const newClient = new NeuralLogClient(config);

      // Initialize the client
      newClient.initialize().catch(error => {
        console.error('Failed to initialize client:', error);
      });

      setClient(newClient);
    };

    initClient();
  }, [authUrl, logsUrl, tenantId, registryUrl]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (!client) return;

      // Check if there's a stored auth token
      const storedAuth = localStorage.getItem('auth');

      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);

          // Validate the stored auth data
          if (authData.token && authData.user) {
            // TODO: Validate token with the auth service

            setUser(authData.user);
            setIsAdmin(authData.user.isAdmin || false);
            setIsAuthenticated(true);

            // Initialize client with the stored auth token
            // This would typically be done by setting the token in the client
          }
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          localStorage.removeItem('auth');
        }
      }
    };

    checkAuth();
  }, [client]);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (!client) return false;

    try {
      // Authenticate with the client
      const success = await client.authenticateWithPassword(username, password);

      if (success) {
        // Get user info
        // This would typically be done by calling an endpoint on the auth service
        const userInfo = {
          id: 'user-id', // This would come from the auth service
          username,
          isAdmin: true, // This would come from the auth service
        };

        // Store auth data
        localStorage.setItem('auth', JSON.stringify({
          token: 'auth-token', // This would come from the auth service
          user: userInfo,
        }));

        setUser(userInfo);
        setIsAdmin(userInfo.isAdmin);
        setIsAuthenticated(true);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);

    // Re-initialize the client
    if (client) {
      client.initialize().catch(error => {
        console.error('Failed to re-initialize client after logout:', error);
      });
    }
  };

  const provisionKEKForUser = async (userId: string, kekVersionId: string): Promise<void> => {
    if (!client || !isAuthenticated || !isAdmin) {
      throw new Error('Not authorized to provision KEK');
    }

    await client.provisionKEKForUser(userId, kekVersionId);
  };

  const splitKEKIntoShares = async (numShares: number, threshold: number): Promise<any[]> => {
    if (!client || !isAuthenticated || !isAdmin) {
      throw new Error('Not authorized to split KEK');
    }

    return await client.splitKEKIntoShares(numShares, threshold);
  };

  const initializeWithRecoveryPhrase = async (recoveryPhrase: string): Promise<boolean> => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    const success = await client.initializeWithRecoveryPhrase(recoveryPhrase);

    if (success) {
      setIsAuthenticated(true);
    }

    return success;
  };

  const initializeWithMnemonic = async (mnemonicPhrase: string): Promise<boolean> => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    const success = await client.initializeWithMnemonic(mnemonicPhrase);

    if (success) {
      setIsAuthenticated(true);
    }

    return success;
  };

  const generateMnemonic = (strength?: number): string => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    return client.generateMnemonic(strength);
  };

  const generateMnemonicQuiz = (mnemonic: string, numQuestions?: number): Array<{ index: number; word: string }> => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    return client.generateMnemonicQuiz(mnemonic, numQuestions);
  };

  const verifyMnemonicQuiz = (mnemonic: string, answers: Array<{ index: number; word: string }>): boolean => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    return client.verifyMnemonicQuiz(mnemonic, answers);
  };

  const recoverKEKVersions = async (versions: string[]): Promise<boolean> => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    return await client.recoverKEKVersions(versions);
  };

  const reconstructKEKFromShares = async (shares: any[]): Promise<void> => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    await client.reconstructKEKFromShares(shares);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        user,
        client,
        login,
        logout,
        initializeWithRecoveryPhrase,
        initializeWithMnemonic,
        generateMnemonic,
        generateMnemonicQuiz,
        verifyMnemonicQuiz,
        recoverKEKVersions,
        provisionKEKForUser,
        splitKEKIntoShares,
        reconstructKEKFromShares,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
