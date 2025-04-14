/**
 * API keys page
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import { Layout } from '../components/layout/Layout';
import { ApiKeyManager } from '../components/api-keys/ApiKeyManager';
import { useNeuralLogContext } from '../contexts/NeuralLogContext';

/**
 * API keys page
 * 
 * @returns Page JSX
 */
const ApiKeysPage: NextPage = () => {
  const { isAuthenticated, isLoading } = useNeuralLogContext();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <Layout>
        <Head>
          <title>API Keys | NeuralLog</title>
        </Head>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>API Keys | NeuralLog</title>
        <meta name="description" content="Manage your API keys" />
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Keys</h1>
        
        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            API keys allow you to authenticate with the NeuralLog API and SDK. They are used to encrypt and decrypt your logs, so keep them secure.
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Important:</strong> API keys are shown only once when created. Make sure to copy and store them securely.
          </p>
        </div>
        
        <ApiKeyManager />
      </div>
    </Layout>
  );
};

export default ApiKeysPage;
