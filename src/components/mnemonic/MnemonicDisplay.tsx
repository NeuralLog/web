import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import { ContentCopy as CopyIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

interface MnemonicDisplayProps {
  mnemonic: string;
  title?: string;
  description?: string;
}

/**
 * Mnemonic Display Component
 * 
 * A reusable component for displaying a BIP-39 mnemonic phrase with copy and show/hide functionality.
 */
const MnemonicDisplay: React.FC<MnemonicDisplayProps> = ({
  mnemonic,
  title = 'Recovery Phrase',
  description
}) => {
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const renderMnemonicWords = () => {
    const words = mnemonic.split(' ');
    
    return (
      <Grid container spacing={1} sx={{ mt: 2 }}>
        {words.map((word, index) => (
          <Grid item xs={4} key={index}>
            <Chip
              label={`${index + 1}. ${word}`}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  };
  
  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      
      {description && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
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
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                size="small"
                startIcon={showMnemonic ? <VisibilityOffIcon /> : <VisibilityIcon />}
                onClick={() => setShowMnemonic(!showMnemonic)}
              >
                {showMnemonic ? "Hide" : "Show"}
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {showMnemonic ? (
            renderMnemonicWords()
          ) : (
            <Box
              sx={{
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body1" color="textSecondary">
                Click "Show" to reveal your recovery phrase
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MnemonicDisplay;
