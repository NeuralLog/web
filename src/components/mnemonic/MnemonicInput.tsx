import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface MnemonicInputProps {
  onSubmit: (mnemonic: string, isValid: boolean) => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

/**
 * Mnemonic Input Component
 * 
 * A reusable component for entering and validating a BIP-39 mnemonic phrase.
 */
const MnemonicInput: React.FC<MnemonicInputProps> = ({
  onSubmit,
  title = 'Enter Your Recovery Phrase',
  description = 'Enter the 12-word mnemonic phrase you created during the initial setup.',
  buttonText = 'Submit'
}) => {
  const { client } = useAuth();
  
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!mnemonic) {
        throw new Error('Recovery phrase is required');
      }
      
      if (!client) {
        throw new Error('Client not initialized');
      }
      
      // Validate the mnemonic
      const isValid = client.getCryptoService().getMnemonicService().validateMnemonic(mnemonic);
      
      if (!isValid) {
        throw new Error('Invalid recovery phrase. Please check that you entered all 12 words correctly.');
      }
      
      // Call the onSubmit callback with the mnemonic and validation status
      onSubmit(mnemonic, isValid);
    } catch (err) {
      console.error('Validation failed:', err);
      setError(`Validation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      
      {description && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        label="Mnemonic Phrase (12 words)"
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
        fullWidth
        margin="normal"
        required
        multiline
        rows={2}
        placeholder="Enter your 12-word mnemonic phrase separated by spaces"
      />
      
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading || !mnemonic}
          onClick={handleSubmit}
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} /> : buttonText}
        </Button>
      </Box>
    </Box>
  );
};

export default MnemonicInput;
