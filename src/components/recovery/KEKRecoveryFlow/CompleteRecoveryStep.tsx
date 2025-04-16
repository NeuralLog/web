import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';

interface CompleteRecoveryStepProps {
  recoverySession: any;
  recoveredKEK: Uint8Array | null;
  onComplete: (newVersionData: any) => void;
  onBack: () => void;
  loading: boolean;
}

/**
 * Component for completing KEK recovery
 */
export const CompleteRecoveryStep: React.FC<CompleteRecoveryStepProps> = ({ 
  recoverySession, 
  recoveredKEK,
  onComplete, 
  onBack,
  loading 
}) => {
  const [newVersionId, setNewVersionId] = useState(`kek-v${Date.now()}`);
  const [reason, setReason] = useState('Recovered from lost password');
  
  const handleComplete = () => {
    // Create new version data
    const newVersionData = {
      id: newVersionId,
      reason,
      recoveredFrom: recoverySession.versionId
    };
    
    onComplete(newVersionData);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Complete KEK Recovery
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The KEK has been successfully reconstructed. Now you need to create a new KEK version with the recovered KEK.
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
          <strong>Status:</strong> Reconstructed
        </Typography>
      </Paper>
      
      <TextField
        margin="normal"
        label="New KEK Version ID"
        fullWidth
        value={newVersionId}
        onChange={(e) => setNewVersionId(e.target.value)}
        disabled={loading}
        helperText="ID for the new KEK version"
      />
      
      <TextField
        margin="normal"
        label="Reason"
        fullWidth
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={loading}
        helperText="Reason for creating the new KEK version"
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleComplete}
          disabled={!newVersionId || !reason || loading || !recoveredKEK}
        >
          {loading ? <CircularProgress size={24} /> : 'Complete Recovery'}
        </Button>
      </Box>
    </Box>
  );
};
