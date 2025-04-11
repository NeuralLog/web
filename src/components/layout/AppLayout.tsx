'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiKey, FiSettings, FiLogOut, FiMoon, FiSun, FiMenu, FiList, FiUserPlus } from 'react-icons/fi';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/context/AuthContext';

interface SidebarItemProps {
  icon: React.ElementType;
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

function SidebarItem({ icon: Icon, href, isActive, children }: SidebarItemProps) {
  return (
    <Link href={href} className="w-full no-underline">
      <div
        className={`flex items-center p-4 mx-4 rounded-lg cursor-pointer group ${isActive ? 'bg-brand-500 text-white' : 'bg-transparent text-gray-600 dark:text-gray-300'} hover:${isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
        data-testid={`sidebar-item-${href.replace(/\//g, '-')}`}
      >
        <Icon className="mr-4 text-base" />
        {children}
      </div>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white no-underline">
              NeuralLog
            </Link>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="p-1 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 px-2 py-4 overflow-y-auto">
            <nav className="flex flex-col space-y-2">
              <SidebarItem icon={FiHome} href="/dashboard" isActive={pathname === '/dashboard'}>
                Dashboard
              </SidebarItem>
              <SidebarItem icon={FiList} href="/logs" isActive={pathname.startsWith('/logs')}>
                Logs
              </SidebarItem>
              <SidebarItem icon={FiKey} href="/apikeys" isActive={pathname === '/apikeys'}>
                API Keys
              </SidebarItem>
              <SidebarItem icon={FiUserPlus} href="/admin/invitations" isActive={pathname === '/admin/invitations'}>
                Invitations
              </SidebarItem>
              <SidebarItem icon={FiSettings} href="/settings" isActive={pathname === '/settings'}>
                Settings
              </SidebarItem>
            </nav>
          </div>
          <div className="flex items-center justify-between p-4 border-t">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <button
              className="p-2 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              onClick={logout}
              aria-label="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white no-underline">
                  NeuralLog
                </Link>
              </div>

              {/* User profile */}
              {user && (
                <div className="flex items-center px-4 py-3 mt-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name || user.email}
                    </div>
                    {user.email && user.name && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col flex-1 mt-5">
                <nav className="flex-1 space-y-2">
                  <SidebarItem icon={FiHome} href="/dashboard" isActive={pathname === '/dashboard'}>
                    Dashboard
                  </SidebarItem>
                  <SidebarItem icon={FiList} href="/logs" isActive={pathname.startsWith('/logs')}>
                    Logs
                  </SidebarItem>
                  <SidebarItem icon={FiKey} href="/apikeys" isActive={pathname === '/apikeys'}>
                    API Keys
                  </SidebarItem>
                  <SidebarItem icon={FiUserPlus} href="/admin/invitations" isActive={pathname === '/admin/invitations'}>
                    Invitations
                  </SidebarItem>
                  <SidebarItem icon={FiSettings} href="/settings" isActive={pathname === '/settings'}>
                    Settings
                  </SidebarItem>
                </nav>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
              <button
                className="p-2 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                onClick={logout}
                aria-label="Logout"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <span className="sr-only">Open sidebar</span>
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="text-lg font-bold text-gray-900 dark:text-white">NeuralLog</div>
            <div className="w-6 h-6" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
