import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { NeuralLogClient } from '@neurallog/typescript-client-sdk';
import { SetupService } from '../services/SetupService';
import { useConfig } from '../hooks/useConfig';

/**
 * Complete Setup Page
 *
 * This page is shown when the user needs to complete the first-time setup.
 */
const CompleteSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { authUrl, tenantId } = useConfig();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [confirmRecoveryPhrase, setConfirmRecoveryPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupService = new SetupService(authUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!username || !password || !recoveryPhrase) {
      setError('Username, password, and recovery phrase are required');
      return;
    }

    if (recoveryPhrase !== confirmRecoveryPhrase) {
      setError('Recovery phrases do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a client instance
      const client = new NeuralLogClient({
        tenantId,
        authUrl
      });

      // Derive master secret from tenant ID and recovery phrase ONLY
      // This keeps the master secret separate from user authentication
      const cryptoService = new client.getCryptoService();
      const masterSecret = await cryptoService.deriveMasterSecret(tenantId, recoveryPhrase);

      // Generate a new KEK
      const kek = await cryptoService.generateKEK();

      // Encrypt the KEK with the master secret
      const encryptedKEK = await cryptoService.encryptKEK(kek, masterSecret);

      // Complete the setup with user credentials and encrypted KEK
      // The user credentials are only for authentication, not for crypto
      await setupService.completeSetup(tenantId, username, password, encryptedKEK);

      // Navigate to the login page
      navigate('/login', { state: { setupComplete: true } });
    } catch (err) {
      console.error('Setup failed:', err);
      setError('Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Complete Setup
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          This is the first-time setup for your NeuralLog tenant.
          Please create an admin account to get started.
        </Typography>

        <Paper elevation={3} sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Tenant ID"
              value={tenantId}
              fullWidth
              margin="normal"
              disabled
              helperText="This is your tenant ID from the environment configuration"
            />

            <TextField
              label="Admin Username"
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
              helperText="This password is used for authentication only."
            />

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Recovery Information
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              The recovery phrase is used to derive your master key and is separate from your login credentials.
              Store it securely as it will be needed for recovery if you lose access to your account.
            </Alert>

            <TextField
              label="Recovery Phrase"
              type="password"
              value={recoveryPhrase}
              onChange={(e) => setRecoveryPhrase(e.target.value)}
              fullWidth
              margin="normal"
              required
              helperText="This phrase is used to derive your master key. Store it securely!"
            />

            <TextField
              label="Confirm Recovery Phrase"
              type="password"
              value={confirmRecoveryPhrase}
              onChange={(e) => setConfirmRecoveryPhrase(e.target.value)}
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
                {loading ? <CircularProgress size={24} /> : 'Complete Setup'}
              </Button>
            </Box>
          </form>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="textSecondary" align="center">
            The recovery phrase is used to derive your master key, which encrypts your Key Encryption Key (KEK).
            This is completely separate from your login credentials and is the foundation of NeuralLog's zero-knowledge architecture.
            <br /><br />
            <strong>Important:</strong> Store this recovery phrase securely. If lost, you will need to use Shamir's Secret Sharing
            or another recovery method to regain access to your encrypted data.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default CompleteSetupPage;
