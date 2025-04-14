/**
 * Custom App component
 */

import React from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { NeuralLogProvider } from '../contexts/NeuralLogContext';
import '../styles/globals.css';

/**
 * Custom App component
 *
 * @param props Component props
 * @returns Component JSX
 */
function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="NeuralLog - Zero-Knowledge Telemetry and Logging Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NeuralLogProvider
        tenantId={process.env.NEXT_PUBLIC_TENANT_ID}
        registryUrl={process.env.NEXT_PUBLIC_REGISTRY_URL}
        authUrl={process.env.NEXT_PUBLIC_AUTH_URL}
        logsUrl={process.env.NEXT_PUBLIC_LOGS_URL}
      >
        <Component {...pageProps} />
      </NeuralLogProvider>
    </>
  );
}

export default MyApp;
