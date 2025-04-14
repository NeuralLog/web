/**
 * Header component
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useNeuralLogContext } from '../../contexts/NeuralLogContext';

/**
 * Header component
 * 
 * @returns Component JSX
 */
export function Header(): JSX.Element {
  const { isAuthenticated, logout } = useNeuralLogContext();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  /**
   * Toggle menu
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            NeuralLog
          </Link>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-4 items-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${
                    router.pathname === '/dashboard' ? 'bg-blue-700' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/logs"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${
                    router.pathname === '/logs' ? 'bg-blue-700' : ''
                  }`}
                >
                  Logs
                </Link>
                <Link
                  href="/api-keys"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${
                    router.pathname === '/api-keys' ? 'bg-blue-700' : ''
                  }`}
                >
                  API Keys
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${
                    router.pathname === '/login' ? 'bg-blue-700' : ''
                  }`}
                >
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="mt-4 md:hidden">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${
                    router.pathname === '/dashboard' ? 'bg-blue-700' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/logs"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${
                    router.pathname === '/logs' ? 'bg-blue-700' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Logs
                </Link>
                <Link
                  href="/api-keys"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${
                    router.pathname === '/api-keys' ? 'bg-blue-700' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  API Keys
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${
                    router.pathname === '/login' ? 'bg-blue-700' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
