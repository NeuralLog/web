'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from './CryptoProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

export const MasterSecretInput: React.FC = () => {
  const { user } = useAuth();
  const { isInitialized, initializeKeyHierarchy } = useCrypto();
  const [masterSecret, setMasterSecret] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Get tenant ID from user
  const tenantId = user?.tenantId || 'default';

  const handleInitialize = () => {
    try {
      if (!masterSecret.trim()) {
        setError('Please enter a master secret');
        return;
      }

      initializeKeyHierarchy(masterSecret, tenantId);
      setSuccess(true);
      setError(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize key hierarchy');
      setSuccess(false);
    }
  };

  // Check if already initialized on mount
  useEffect(() => {
    const storedMasterSecret = localStorage.getItem('neurallog_master_secret');
    if (storedMasterSecret) {
      setMasterSecret(storedMasterSecret);
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Zero-Knowledge Encryption</CardTitle>
        <CardDescription>
          {isInitialized
            ? 'Your encryption keys are set up. You can view encrypted logs.'
            : 'Enter your master secret to decrypt logs'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Key hierarchy initialized successfully</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="masterSecret" className="text-sm font-medium">
              Master Secret
            </label>
            <Input
              id="masterSecret"
              type="password"
              placeholder="Enter your master secret"
              value={masterSecret}
              onChange={(e) => setMasterSecret(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInitialize()}
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            This secret is used to derive encryption keys. It never leaves your browser.
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleInitialize}
          className="w-full"
          variant={isInitialized ? 'outline' : 'default'}
        >
          {isInitialized ? 'Update Keys' : 'Initialize Keys'}
        </Button>
      </CardFooter>
    </Card>
  );
};
