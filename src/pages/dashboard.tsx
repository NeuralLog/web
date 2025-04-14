/**
 * Dashboard page
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import { Layout } from '../components/layout/Layout';
import { useNeuralLogContext } from '../contexts/NeuralLogContext';

/**
 * Log stats
 */
interface LogStats {
  /**
   * Log name
   */
  name: string;
  
  /**
   * Total entries
   */
  totalEntries: number;
  
  /**
   * First entry time
   */
  firstEntryTime: string;
  
  /**
   * Last entry time
   */
  lastEntryTime: string;
  
  /**
   * Size in bytes
   */
  sizeBytes: number;
}

/**
 * Dashboard page
 * 
 * @returns Page JSX
 */
const DashboardPage: NextPage = () => {
  const { isAuthenticated, isLoading, getLogNames, getLogs } = useNeuralLogContext();
  const router = useRouter();
  
  const [logStats, setLogStats] = useState<LogStats[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);
  
  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    setDashboardLoading(true);
    setError(null);
    
    try {
      // Get log names
      const names = await getLogNames();
      
      // Get stats for each log
      const stats: LogStats[] = [];
      
      for (const name of names) {
        try {
          // Get recent logs to calculate stats
          const logs = await getLogs(name, { limit: 100 });
          
          if (logs.length > 0) {
            // Sort logs by timestamp
            const sortedLogs = [...logs].sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            const firstLog = sortedLogs[0];
            const lastLog = sortedLogs[sortedLogs.length - 1];
            
            // Calculate size (rough estimate)
            const sizeBytes = logs.reduce((total, log) => {
              return total + JSON.stringify(log).length;
            }, 0);
            
            stats.push({
              name,
              totalEntries: logs.length,
              firstEntryTime: firstLog.timestamp,
              lastEntryTime: lastLog.timestamp,
              sizeBytes
            });
          } else {
            stats.push({
              name,
              totalEntries: 0,
              firstEntryTime: '',
              lastEntryTime: '',
              sizeBytes: 0
            });
          }
        } catch (error) {
          console.error(`Error getting stats for log ${name}:`, error);
        }
      }
      
      setLogStats(stats);
      
      // Get recent logs across all logs
      let allRecentLogs: any[] = [];
      
      for (const name of names.slice(0, 3)) { // Limit to first 3 logs for performance
        try {
          const logs = await getLogs(name, { limit: 5 });
          
          allRecentLogs = [
            ...allRecentLogs,
            ...logs.map(log => ({
              ...log,
              logName: name
            }))
          ];
        } catch (error) {
          console.error(`Error getting recent logs for ${name}:`, error);
        }
      }
      
      // Sort by timestamp (newest first)
      allRecentLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Take the 10 most recent logs
      setRecentLogs(allRecentLogs.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setDashboardLoading(false);
    }
  };
  
  /**
   * Format bytes
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  /**
   * Format log data
   */
  const formatLogData = (data: any): string => {
    try {
      if (typeof data === 'object') {
        // If it has a message property, prioritize that
        if (data.message) {
          return data.message;
        }
        
        // Otherwise, stringify the first few properties
        const entries = Object.entries(data).slice(0, 2);
        return entries.map(([key, value]) => `${key}: ${value}`).join(', ') + 
          (Object.keys(data).length > 2 ? '...' : '');
      }
      
      return String(data);
    } catch (error) {
      return String(data);
    }
  };
  
  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <Layout>
        <Head>
          <title>Dashboard | NeuralLog</title>
        </Head>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>Dashboard | NeuralLog</title>
        <meta name="description" content="NeuralLog dashboard" />
      </Head>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={loadDashboardData}
            disabled={dashboardLoading}
          >
            {dashboardLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {dashboardLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Log stats */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Log Statistics</h2>
              
              {logStats.length === 0 ? (
                <p className="text-gray-500">No logs found. Create your first log to get started.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {logStats.map((stat) => (
                    <div key={stat.name} className="bg-white shadow rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-2">{stat.name}</h3>
                      <div className="space-y-2">
                        <p className="flex justify-between">
                          <span className="text-gray-500">Entries:</span>
                          <span className="font-medium">{stat.totalEntries}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-500">Size:</span>
                          <span className="font-medium">{formatBytes(stat.sizeBytes)}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-500">First Entry:</span>
                          <span className="font-medium">{formatDate(stat.firstEntryTime)}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-500">Last Entry:</span>
                          <span className="font-medium">{formatDate(stat.lastEntryTime)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Recent logs */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Recent Logs</h2>
              
              {recentLogs.length === 0 ? (
                <p className="text-gray-500">No recent logs found.</p>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Log
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.logName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                            {formatLogData(log.data)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
