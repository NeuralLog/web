/**
 * Layout component
 */

import React, { ReactNode } from 'react';
import { NeuralLogProvider } from '../../contexts/NeuralLogContext';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Layout props
 */
interface LayoutProps {
  /**
   * Children
   */
  children: ReactNode;
}

/**
 * Layout component
 * 
 * @param props Component props
 * @returns Component JSX
 */
export function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <NeuralLogProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </NeuralLogProvider>
  );
}
