/**
 * Home page
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { useNeuralLogContext } from '../contexts/NeuralLogContext';

/**
 * Home page
 * 
 * @returns Page JSX
 */
const HomePage: NextPage = () => {
  const { isAuthenticated, isLoading } = useNeuralLogContext();
  const router = useRouter();
  
  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);
  
  return (
    <Layout>
      <Head>
        <title>NeuralLog - Zero-Knowledge Telemetry and Logging Service</title>
        <meta name="description" content="Secure, private, and scalable telemetry and logging service for AI applications" />
      </Head>
      
      {/* Hero section */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
              Zero-Knowledge Telemetry and Logging for AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Secure, private, and scalable logging service that keeps your data encrypted end-to-end.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                Get Started
              </Link>
              <a
                href="https://docs.neurallog.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg text-lg"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Zero-Knowledge Architecture</h3>
              <p className="text-gray-600">
                Your data is encrypted before it leaves your client. We never have access to your encryption keys or plaintext data.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Multi-Tenant Support</h3>
              <p className="text-gray-600">
                Securely share logs with your team while maintaining end-to-end encryption and granular access control.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Searchable Encryption</h3>
              <p className="text-gray-600">
                Search your encrypted logs without compromising security, using our advanced searchable encryption technology.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it works section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <ol className="space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold text-lg">
                    1
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold mb-1">Client-Side Encryption</h3>
                    <p className="text-gray-600">
                      Your data is encrypted in your browser or application before it's sent to our servers.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold text-lg">
                    2
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold mb-1">Secure Storage</h3>
                    <p className="text-gray-600">
                      We store your encrypted data without the ability to decrypt it. Only you hold the keys.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold text-lg">
                    3
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold mb-1">Client-Side Decryption</h3>
                    <p className="text-gray-600">
                      When you access your logs, they're decrypted locally in your browser or application.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>
{`// Example using the NeuralLog Client SDK
import { NeuralLogClient } from '@neurallog/client-sdk';

// Initialize client
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id'
});

// Authenticate with API key
await client.authenticateWithApiKey('your-api-key');

// Log data (encrypted client-side)
await client.log('application-logs', {
  level: 'info',
  message: 'User logged in',
  userId: '123',
  timestamp: new Date().toISOString()
});

// Retrieve logs (decrypted client-side)
const logs = await client.getLogs('application-logs');
console.log(logs);`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8">
            Sign up for free and start logging securely today.
          </p>
          <Link
            href="/login"
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
