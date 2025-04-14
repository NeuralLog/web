/**
 * Login page
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import { Layout } from '../components/layout/Layout';
import { LoginForm } from '../components/auth/LoginForm';
import { useNeuralLogContext } from '../contexts/NeuralLogContext';

/**
 * Login page
 * 
 * @returns Page JSX
 */
const LoginPage: NextPage = () => {
  const { isAuthenticated, isLoading } = useNeuralLogContext();
  const router = useRouter();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);
  
  /**
   * Handle successful login
   */
  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };
  
  return (
    <Layout>
      <Head>
        <title>Login | NeuralLog</title>
        <meta name="description" content="Log in to your NeuralLog account" />
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Log In to NeuralLog</h1>
        
        <LoginForm onSuccess={handleLoginSuccess} />
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="https://neurallog.com/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
