import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { SerializedSecretShare } from '@neurallog/typescript-client-sdk';
import { useConfig } from '../hooks/useConfig';
import { MnemonicInputGrid } from '../components/mnemonic';
import { KEKVersionRecovery } from '../components/recovery';
import KEKRecoveryFlow from '../components/recovery/KEKRecoveryFlow';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recovery-tabpanel-${index}`}
      aria-labelledby={`recovery-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Recovery Page
 *
 * This page allows users to recover their KEK using either a recovery phrase
 * or Shamir's Secret Sharing.
 */
const RecoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenantId } = useConfig();
  const { reconstructKEKFromShares, client, initializeWithRecoveryPhrase, initializeWithMnemonic } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [mnemonicWords, setMnemonicWords] = useState<string[]>(Array(12).fill(''));
  const [shares, setShares] = useState<string[]>(['']);
  const [kekVersions, setKekVersions] = useState<string[]>(['v1']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'initial' | 'kek_recovery'>('initial');

  const handleAddShare = () => {
    setShares([...shares, '']);
  };

  const handleRemoveShare = (index: number) => {
    const newShares = [...shares];
    newShares.splice(index, 1);
    setShares(newShares);
  };

  const handleShareChange = (index: number, value: string) => {
    const newShares = [...shares];
    newShares[index] = value;
    setShares(newShares);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleRecoveryWithPhrase = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!recoveryPhrase) {
        throw new Error('Recovery phrase is required');
      }

      if (!client) {
        throw new Error('Client not initialized');
      }

      // Initialize with recovery phrase
      const success = await initializeWithRecoveryPhrase(recoveryPhrase);

      if (success) {
        setSuccess(true);

        // Navigate to dashboard after a delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error('Failed to initialize with recovery phrase');
      }
    } catch (err) {
      console.error('Recovery failed:', err);
      setError(`Recovery failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryWithMnemonic = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if all words are filled
      if (mnemonicWords.some(word => !word)) {
        throw new Error('Please fill in all 12 words of your mnemonic phrase');
      }

      if (!client) {
        throw new Error('Client not initialized');
      }

      // Join words into a mnemonic phrase
      const mnemonicPhrase = mnemonicWords.join(' ');

      // Validate mnemonic
      const mnemonicService = client.getCryptoService().getMnemonicService();
      if (!mnemonicService.validateMnemonic(mnemonicPhrase)) {
        throw new Error('Invalid mnemonic phrase. Please check that you entered the correct words.');
      }

      // Initialize with mnemonic phrase
      const success = await initializeWithMnemonic(mnemonicPhrase);

      if (success) {
        setSuccess(true);

        // Move to KEK recovery step
        setRecoveryStep('kek_recovery');
      } else {
        throw new Error('Failed to initialize with mnemonic phrase');
      }
    } catch (err) {
      console.error('Recovery failed:', err);
      setError(`Recovery failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKEKVersionsRecovered = (versions: string[]) => {
    setKekVersions(versions);

    // Navigate to dashboard after a delay
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  const handleRecoveryWithShares = async () => {
    setLoading(true);
    setError(null);

    try {
      // Parse shares
      const parsedShares: SerializedSecretShare[] = shares
        .filter(share => share.trim() !== '')
        .map(share => {
          try {
            return JSON.parse(share);
          } catch (err) {
            throw new Error(`Invalid share format: ${share}`);
          }
        });

      if (parsedShares.length < 2) {
        throw new Error('At least 2 shares are required for recovery');
      }

      // Reconstruct KEK
      await reconstructKEKFromShares(parsedShares);

      setSuccess(true);

      // Navigate to dashboard after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Recovery failed:', err);
      setError(`Recovery failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Recover Access
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Recover access to your NeuralLog account using your recovery phrase or Shamir's Secret Sharing.
        </Typography>

        <Paper elevation={3}>
          {error && (
            <Alert severity="error" sx={{ m: 3 }}>
              {error}
            </Alert>
          )}

          {success && recoveryStep === 'initial' && (
            <Alert severity="success" sx={{ m: 3 }}>
              Recovery successful! Please recover your KEK versions to access your logs.
            </Alert>
          )}

          {success && recoveryStep === 'kek_recovery' && (
            <Alert severity="success" sx={{ m: 3 }}>
              KEK versions recovered! Redirecting to dashboard...
            </Alert>
          )}

          {recoveryStep === 'initial' ? (
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                aria-label="recovery methods"
              >
                <Tab label="Mnemonic Phrase" id="recovery-tab-0" aria-controls="recovery-tabpanel-0" />
                <Tab label="Legacy Recovery Phrase" id="recovery-tab-1" aria-controls="recovery-tabpanel-1" />
                <Tab label="Secret Shares" id="recovery-tab-2" aria-controls="recovery-tabpanel-2" />
                <Tab label="KEK Recovery" id="recovery-tab-3" aria-controls="recovery-tabpanel-3" />
              </Tabs>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <KEKVersionRecovery
                onComplete={handleKEKVersionsRecovered}
              />
            </Box>
          )}

          {/* Mnemonic Phrase Tab */}
          {recoveryStep === 'initial' && <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Enter Your Mnemonic Phrase
            </Typography>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Enter the 12-word mnemonic phrase you created during the initial setup.
              This phrase is used to derive your master key.
            </Typography>

            <MnemonicInputGrid
              value={mnemonicWords}
              onChange={setMnemonicWords}
              error={!!error}
              helperText="Enter each word of your 12-word mnemonic phrase"
            />

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || success || mnemonicWords.some(word => !word)}
                onClick={handleRecoveryWithMnemonic}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Recover with Mnemonic'}
              </Button>
            </Box>
          </TabPanel>}

          {/* Legacy Recovery Phrase Tab */}
          {recoveryStep === 'initial' && <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Enter Your Legacy Recovery Phrase
            </Typography>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Enter the recovery phrase you created during the initial setup.
              This is for accounts created before the mnemonic phrase system was implemented.
            </Typography>

            <TextField
              label="Recovery Phrase"
              type="password"
              value={recoveryPhrase}
              onChange={(e) => setRecoveryPhrase(e.target.value)}
              fullWidth
              margin="normal"
              required
            />

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || success || !recoveryPhrase}
                onClick={handleRecoveryWithPhrase}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Recover with Legacy Phrase'}
              </Button>
            </Box>
          </TabPanel>}

          {/* Secret Shares Tab */}
          {recoveryStep === 'initial' && <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Enter Your Secret Shares
            </Typography>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Enter the secret shares that were generated when you shared your KEK.
              You need at least the threshold number of shares to recover your KEK.
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              {shares.map((share, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label={`Share ${index + 1}`}
                    value={share}
                    onChange={(e) => handleShareChange(index, e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                  />

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveShare(index)}
                    disabled={shares.length <= 1}
                    sx={{ alignSelf: 'center' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddShare}
              sx={{ mb: 3 }}
            >
              Add Share
            </Button>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || success || shares.every(s => s.trim() === '')}
                onClick={handleRecoveryWithShares}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Recover with Shares'}
              </Button>
            </Box>
          </TabPanel>}

          {/* KEK Recovery Flow Tab */}
          {recoveryStep === 'initial' && <TabPanel value={tabValue} index={3}>
            <KEKRecoveryFlow
              onComplete={() => {
                setSuccess(true);
                // Navigate to dashboard after a delay
                setTimeout(() => {
                  navigate('/');
                }, 3000);
              }}
              onCancel={() => setTabValue(0)}
            />
          </TabPanel>}
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="textSecondary" align="center">
            If you don't have your recovery phrase or enough shares to recover your KEK,
            please contact your administrator for assistance.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default RecoveryPage;
