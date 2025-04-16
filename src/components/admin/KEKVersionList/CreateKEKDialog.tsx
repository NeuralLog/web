import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

interface CreateKEKDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Dialog for creating a new KEK version
 */
export const CreateKEKDialog: React.FC<CreateKEKDialogProps> = ({ open, onClose, onSuccess }) => {
  const { client } = useAuth();
  
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCreateKEKVersion = async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await client.createKEKVersion(reason);
      onSuccess('KEK version created successfully');
      setReason('');
    } catch (err) {
      console.error('Error creating KEK version:', err);
      setError(`Failed to create KEK version: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create KEK Version</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Reason"
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleCreateKEKVersion}
          color="primary"
          disabled={!reason || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
