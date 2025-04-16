import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

interface RotateKEKDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Dialog for rotating the KEK
 */
export const RotateKEKDialog: React.FC<RotateKEKDialogProps> = ({ open, onClose, onSuccess }) => {
  const { client } = useAuth();
  
  const [reason, setReason] = useState('');
  const [removedUsers, setRemovedUsers] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleRotateKEK = async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const removedUsersList = removedUsers.split(',').map(u => u.trim()).filter(u => u);
      
      // Rotate KEK
      const newVersion = await client.rotateKEK(reason, removedUsersList);
      
      // Initialize with recovery phrase
      await client.initializeWithRecoveryPhrase(recoveryPhrase, [newVersion.id]);
      
      onSuccess('KEK rotated successfully');
      setReason('');
      setRemovedUsers('');
      setRecoveryPhrase('');
    } catch (err) {
      console.error('Error rotating KEK:', err);
      setError(`Failed to rotate KEK: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setReason('');
    setRemovedUsers('');
    setRecoveryPhrase('');
    setError(null);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Rotate KEK</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Rotating the KEK creates a new version and sets it as the active version. All new logs will be encrypted with the new KEK version.
            You will need to re-encrypt existing logs to use the new KEK version.
          </Typography>
        </Box>
        
        <TextField
          autoFocus
          margin="dense"
          label="Reason"
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          label="Removed Users (comma-separated)"
          fullWidth
          value={removedUsers}
          onChange={(e) => setRemovedUsers(e.target.value)}
          helperText="Optional: List users to remove from access"
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          label="Recovery Phrase"
          fullWidth
          type="password"
          value={recoveryPhrase}
          onChange={(e) => setRecoveryPhrase(e.target.value)}
          helperText="Required to initialize with the new KEK version"
          error={!!error}
          sx={{ mb: 1 }}
        />
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleRotateKEK}
          color="primary"
          disabled={!reason || !recoveryPhrase || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Rotate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
