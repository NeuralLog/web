'use client';

import React from 'react';
import { RetentionPolicySettings } from '@/components/settings';
import { FiClock } from 'react-icons/fi';

export default function RetentionSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Retention Policy Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <FiClock className="text-2xl text-brand-500 mr-3" />
          <h2 className="text-xl font-semibold">Data Retention</h2>
        </div>
        <p className="mb-4">
          Configure how long your logs are stored before being automatically deleted. You can set a default policy for all logs
          or configure specific retention periods for individual logs.
        </p>
        <p className="mb-4">
          Retention policies help you comply with data protection regulations and manage storage costs by automatically
          removing data that is no longer needed.
        </p>
      </div>
      
      <div className="mx-auto">
        <RetentionPolicySettings />
      </div>
    </div>
  );
}
