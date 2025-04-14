'use client';

import React from 'react';
import { ZeroKnowledgeDashboard } from '@/components/dashboard/ZeroKnowledgeDashboard';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">NeuralLog Dashboard</h1>
      <ZeroKnowledgeDashboard />
    </div>
  );
}
