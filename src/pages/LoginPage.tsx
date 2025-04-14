import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  setupComplete?: boolean;
}

/**
 * Login Page
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupCompleteSnack, setSetupCompleteSnack] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Check if setup was just completed
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.setupComplete) {
      setSetupCompleteSnack(true);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await login(username, password);

      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          NeuralLog
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 4 }}>
          Zero-Knowledge Telemetry and Logging
        </Typography>

        <Paper elevation={3} sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => navigate('/recovery')}
                >
                  Recover using secret shares
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="textSecondary" align="center">
            NeuralLog uses zero-knowledge encryption to ensure your logs remain private.
            <br />
            All encryption and decryption happens in your browser.
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={setupCompleteSnack}
        autoHideDuration={6000}
        onClose={() => setSetupCompleteSnack(false)}
        message="Setup completed successfully. Please log in with your credentials."
      />
    </Container>
  );
};

export default LoginPage;
