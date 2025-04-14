'use client';

import React, { useState, useEffect } from 'react';
// Using the existing CryptoProvider
import { LogSelector } from '@/components/logs/LogSelector';
import { ClientSideLogViewer } from '@/components/logs/ClientSideLogViewer';
import { ClientSideLogSearch } from '@/components/logs/ClientSideLogSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MasterSecretInput } from '@/components/crypto/MasterSecretInput';
import { useAuth } from '@/hooks/useAuth';

export const ZeroKnowledgeDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [selectedLog, setSelectedLog] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<string>('view');

  // Get tenant ID from user
  const tenantId = user?.tenantId || 'default';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please log in to view logs.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Zero-Knowledge Encryption</CardTitle>
            <CardDescription>
              Set up your encryption keys to view logs securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MasterSecretInput />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Log Explorer</CardTitle>
              <LogSelector
                onSelectLog={setSelectedLog}
                selectedLog={selectedLog}
              />
            </div>
          </CardHeader>
          <CardContent>
            {selectedLog ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="view">View</TabsTrigger>
                  <TabsTrigger value="search">Search</TabsTrigger>
                </TabsList>
                <TabsContent value="view">
                  <ClientSideLogViewer logName={selectedLog} limit={100} />
                </TabsContent>
                <TabsContent value="search">
                  <ClientSideLogSearch logName={selectedLog} limit={100} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center p-4">
                <p>Select a log to view or search</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};
