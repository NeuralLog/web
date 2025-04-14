/**
 * Create log page
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../../components/layout/Layout';
import { LogCreator } from '../../components/logs/LogCreator';
import { useNeuralLogContext } from '../../contexts/NeuralLogContext';

/**
 * Create log page
 * 
 * @returns Page JSX
 */
const CreateLogPage: NextPage = () => {
  const { isAuthenticated, isLoading } = useNeuralLogContext();
  const router = useRouter();
  
  // Get log name from query
  const { log: logName } = router.query;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  /**
   * Handle successful log creation
   */
  const handleSuccess = () => {
    // Redirect to logs page after successful creation
    router.push('/logs');
  };
  
  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <Layout>
        <Head>
          <title>Create Log | NeuralLog</title>
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
        <title>Create Log | NeuralLog</title>
        <meta name="description" content="Create a new log entry" />
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create Log</h1>
          <Link
            href="/logs"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Logs
          </Link>
        </div>
        
        <LogCreator 
          initialLogName={typeof logName === 'string' ? logName : undefined}
          onSuccess={handleSuccess}
        />
      </div>
    </Layout>
  );
};

export default CreateLogPage;
