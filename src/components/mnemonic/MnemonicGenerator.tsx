import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import { ContentCopy as CopyIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import MnemonicInputGrid from './MnemonicWordInput';

interface MnemonicGeneratorProps {
  onGenerated: (mnemonic: string) => void;
  strength?: number;
  title?: string;
  description?: string;
  showRefreshButton?: boolean;
}

/**
 * Mnemonic Generator Component
 * 
 * Generates and displays a BIP-39 mnemonic phrase.
 */
const MnemonicGenerator: React.FC<MnemonicGeneratorProps> = ({
  onGenerated,
  strength = 128, // 128 bits = 12 words
  title = 'Your Recovery Phrase',
  description,
  showRefreshButton = true
}) => {
  const { generateMnemonic } = useAuth();
  
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate mnemonic on component mount
  useEffect(() => {
    generateNewMnemonic();
  }, []);
  
  const generateNewMnemonic = () => {
    setLoading(true);
    setError(null);
    
    try {
      const newMnemonic = generateMnemonic(strength);
      setMnemonic(newMnemonic);
      setMnemonicWords(newMnemonic.split(' '));
      onGenerated(newMnemonic);
    } catch (err) {
      console.error('Failed to generate mnemonic:', err);
      setError('Failed to generate recovery phrase. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">
          IMPORTANT: Write down these 12 words and keep them in a safe place.
        </Typography>
        <Typography variant="body2">
          This recovery phrase is the only way to recover your encrypted data if you forget your password.
          Anyone with access to this phrase can access your encrypted data.
        </Typography>
      </Alert>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Card variant="outlined" sx={{ mb: 3, bgcolor: 'background.default' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Recovery Phrase (12 words)
            </Typography>
            <Box>
              <Button
                size="small"
                startIcon={<CopyIcon />}
                onClick={handleCopyMnemonic}
                color={copied ? "success" : "primary"}
                disabled={loading}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
              
              {showRefreshButton && (
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={generateNewMnemonic}
                  disabled={loading}
                  sx={{ ml: 1 }}
                >
                  Regenerate
                </Button>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <MnemonicInputGrid
              value={mnemonicWords}
              onChange={() => {}} // Read-only
              readOnly={true}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MnemonicGenerator;
