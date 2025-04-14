'use client';

import React, { useState } from 'react';
import { ClientCryptoProvider } from '@/components/crypto/ClientCryptoProvider';
import { LogSelector } from '@/components/logs/LogSelector';
import { ClientSideLogViewer } from '@/components/logs/ClientSideLogViewer';
import { ClientSideLogSearch } from '@/components/logs/ClientSideLogSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MasterSecretInput } from '@/components/crypto/MasterSecretInput';
import { useAuth } from '@/hooks/useAuth';

export default function LogsPage() {
  const { user, isLoading } = useAuth();
  const [selectedLog, setSelectedLog] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<string>('view');

  // Get tenant ID from user
  const tenantId = user?.tenantId || 'default';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to view logs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <ClientCryptoProvider initialTenantId={tenantId}>
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Logs Dashboard</CardTitle>
            <CardDescription>
              View and search logs for your tenant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MasterSecretInput />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
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
      </div>
    </ClientCryptoProvider>
  );
}
