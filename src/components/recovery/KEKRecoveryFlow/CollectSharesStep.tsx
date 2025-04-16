import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface CollectSharesStepProps {
  recoverySession: any;
  onCollectShares: (shares: any[]) => void;
  onBack: () => void;
  loading: boolean;
}

/**
 * Component for collecting shares during KEK recovery
 */
export const CollectSharesStep: React.FC<CollectSharesStepProps> = ({ 
  recoverySession, 
  onCollectShares, 
  onBack,
  loading 
}) => {
  const [shareInput, setShareInput] = useState('');
  const [shares, setShares] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const handleAddShare = () => {
    try {
      // Try to parse the share as JSON
      const shareData = JSON.parse(shareInput);
      
      // Validate the share
      if (!shareData.x || !shareData.y) {
        throw new Error('Invalid share format: missing x or y value');
      }
      
      // Add the share to the list
      setShares([...shares, shareData]);
      
      // Clear the input
      setShareInput('');
      setError(null);
    } catch (err) {
      setError(`Invalid share format: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const handleRemoveShare = (index: number) => {
    const newShares = [...shares];
    newShares.splice(index, 1);
    setShares(newShares);
  };
  
  const handleCollectShares = () => {
    onCollectShares(shares);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Collect Recovery Shares
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Collect at least {recoverySession.threshold} shares to recover the KEK. Each share should be in JSON format with x and y values.
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Recovery Session Details
        </Typography>
        <Typography variant="body2">
          <strong>Session ID:</strong> {recoverySession.id}
        </Typography>
        <Typography variant="body2">
          <strong>KEK Version:</strong> {recoverySession.versionId}
        </Typography>
        <Typography variant="body2">
          <strong>Threshold:</strong> {recoverySession.threshold}
        </Typography>
        <Typography variant="body2">
          <strong>Expires At:</strong> {new Date(recoverySession.expiresAt).toLocaleString()}
        </Typography>
      </Paper>
      
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          label="Share (JSON format)"
          value={shareInput}
          onChange={(e) => setShareInput(e.target.value)}
          error={!!error}
          helperText={error}
          disabled={loading}
          multiline
          rows={3}
        />
        <IconButton 
          color="primary" 
          onClick={handleAddShare} 
          disabled={!shareInput || loading}
          sx={{ ml: 1, alignSelf: 'center' }}
        >
          <AddIcon />
        </IconButton>
      </Box>
      
      <Typography variant="subtitle2" gutterBottom>
        Collected Shares ({shares.length}/{recoverySession.threshold})
      </Typography>
      
      <Paper variant="outlined" sx={{ mb: 3, maxHeight: 200, overflow: 'auto' }}>
        {shares.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No shares collected yet
            </Typography>
          </Box>
        ) : (
          <List dense>
            {shares.map((share, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveShare(index)} disabled={loading}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`Share ${index + 1}`}
                    secondary={`x: ${share.x}`}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCollectShares}
          disabled={shares.length < recoverySession.threshold || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Reconstruct KEK'}
        </Button>
      </Box>
    </Box>
  );
};
