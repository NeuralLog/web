'use client';

import React from 'react';
import Link from 'next/link';
import { FiLock, FiUser, FiShield, FiClock } from 'react-icons/fi';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Encryption Settings */}
        <Link href="/settings/encryption" className="no-underline">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <FiLock className="text-2xl text-brand-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Encryption</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Configure zero-knowledge encryption settings for your logs. Enable client-side encryption to ensure your data remains private.
            </p>
          </div>
        </Link>

        {/* Profile Settings */}
        <Link href="/settings/profile" className="no-underline">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <FiUser className="text-2xl text-brand-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Update your profile information, change your password, and manage your account settings.
            </p>
          </div>
        </Link>

        {/* Security Settings */}
        <Link href="/settings/security" className="no-underline">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <FiShield className="text-2xl text-brand-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Manage security settings, two-factor authentication, and session management for your account.
            </p>
          </div>
        </Link>

        {/* Retention Policy Settings */}
        <Link href="/settings/retention" className="no-underline">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <FiClock className="text-2xl text-brand-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Retention</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Configure how long your logs are stored before being automatically deleted. Set default and per-log retention policies.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
