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
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../hooks/useConfig';
import { SetupService } from '../services/SetupService';
import { MnemonicGenerator, MnemonicVerifier } from '../components/mnemonic';

/**
 * Mnemonic Setup Page
 *
 * This page guides the user through the process of setting up their account
 * with a BIP-39 mnemonic phrase for recovery.
 */
const MnemonicSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { authUrl, tenantId } = useConfig();
  const { generateMnemonic, generateMnemonicQuiz, verifyMnemonicQuiz } = useAuth();

  // Setup state
  const [activeStep, setActiveStep] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mnemonic state
  const [mnemonic, setMnemonic] = useState('');
  const [verified, setVerified] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupService = new SetupService(authUrl);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate user credentials
      if (!username || !password) {
        setError('Username and password are required');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setError(null);
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Move to verification step
      if (!mnemonic) {
        setError('Recovery phrase generation failed');
        return;
      }

      setError(null);
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Complete setup
      if (!verified) {
        setError('Please verify your recovery phrase');
        return;
      }

      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleMnemonicGenerated = (generatedMnemonic: string) => {
    setMnemonic(generatedMnemonic);
  };

  const handleMnemonicVerified = (isVerified: boolean) => {
    setVerified(isVerified);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!client) {
        throw new Error('Client not initialized');
      }

      // Derive master secret from tenant ID and mnemonic
      const cryptoService = client.getCryptoService();
      const masterSecret = await cryptoService.deriveMasterSecretFromMnemonic(tenantId, mnemonic);

      // Generate a new KEK
      const kek = await cryptoService.generateKEK();

      // Encrypt the KEK with the master secret
      const encryptedKEK = await cryptoService.encryptKEK(kek, masterSecret);

      // Complete the setup
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
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Complete Setup
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          This is the first-time setup for your NeuralLog tenant.
          Please create an admin account and secure recovery phrase.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Account Information</StepLabel>
          </Step>
          <Step>
            <StepLabel>Recovery Phrase</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verification</StepLabel>
          </Step>
        </Stepper>

        <Paper elevation={3} sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Create Admin Account
              </Typography>

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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                These credentials will be used for authentication only.
                In the next step, you'll create a recovery phrase for cryptographic operations.
              </Typography>
            </>
          )}

          {activeStep === 1 && (
            <MnemonicGenerator
              onGenerated={handleMnemonicGenerated}
              title="Your Recovery Phrase"
              description="This 12-word phrase will be used to recover your encrypted data. Write it down and keep it in a safe place."
            />
          )}

          {activeStep === 2 && (
            <MnemonicVerifier
              mnemonic={mnemonic}
              onVerify={handleMnemonicVerified}
              numWords={3}
            />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
            >
              Back
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={loading || (activeStep === 2 && !verified)}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === 2 ? (
                'Complete Setup'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="textSecondary" align="center">
            NeuralLog uses a zero-knowledge architecture to ensure your data remains private.
            Your recovery phrase is used to derive your master key, which encrypts your Key Encryption Key (KEK).
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};



export default MnemonicSetupPage;
