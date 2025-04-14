import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { SetupService } from './services/SetupService';
import { useConfig } from './hooks/useConfig';

// Pages
import LoginPage from './pages/LoginPage';
import MnemonicSetupPage from './pages/MnemonicSetupPage';
import DashboardPage from './pages/DashboardPage';
import LogsPage from './pages/LogsPage';
import LogDetailPage from './pages/LogDetailPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import RecoveryPage from './pages/RecoveryPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  const { authUrl, tenantId } = useConfig();
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (!tenantId) {
        console.error('Tenant ID is not set. Please set REACT_APP_TENANT_ID in your environment variables.');
        setLoading(false);
        return;
      }

      try {
        const setupService = new SetupService(authUrl);
        const isFirstTime = await setupService.isFirstTimeSetup(tenantId);
        setIsFirstTimeSetup(isFirstTime);
      } catch (error) {
        console.error('Error checking setup status:', error);
        // Default to not first-time setup if there's an error
        setIsFirstTimeSetup(false);
      } finally {
        setLoading(false);
      }
    };

    checkSetupStatus();
  }, [authUrl, tenantId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recovery" element={<RecoveryPage />} />

          {/* First-time setup route */}
          {isFirstTimeSetup && (
            <Route path="/setup" element={<MnemonicSetupPage />} />
          )}

          {/* Redirect to setup if it's first-time setup */}
          {isFirstTimeSetup && (
            <Route path="*" element={<Navigate to="/setup" replace />} />
          )}

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
          <Route path="/logs/:logId" element={<ProtectedRoute><LogDetailPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
