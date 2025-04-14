/**
 * Logs page
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../../components/layout/Layout';
import { LogViewer } from '../../components/logs/LogViewer';
import { useNeuralLogContext } from '../../contexts/NeuralLogContext';

/**
 * Logs page
 * 
 * @returns Page JSX
 */
const LogsPage: NextPage = () => {
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
  
  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <Layout>
        <Head>
          <title>Logs | NeuralLog</title>
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
        <title>Logs | NeuralLog</title>
        <meta name="description" content="View and search logs" />
      </Head>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Logs</h1>
          <div className="space-x-4">
            <Link
              href="/logs/create"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Log
            </Link>
          </div>
        </div>
        
        <LogViewer initialLogName={typeof logName === 'string' ? logName : undefined} />
      </div>
    </Layout>
  );
};

export default LogsPage;
