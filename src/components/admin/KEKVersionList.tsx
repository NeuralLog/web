import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component for displaying and managing KEK versions
 */
const KEKVersionList: React.FC = () => {
  const { client } = useAuth();
  const [kekVersions, setKekVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [removedUsers, setRemovedUsers] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  
  /**
   * Fetch KEK versions
   */
  const fetchKEKVersions = async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const versions = await client.getKEKVersions();
      setKekVersions(versions);
    } catch (err) {
      console.error('Error fetching KEK versions:', err);
      setError(`Failed to fetch KEK versions: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Create a new KEK version
   */
  const handleCreateKEKVersion = async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!reason) {
        throw new Error('Reason is required');
      }
      
      if (!recoveryPhrase) {
        throw new Error('Recovery phrase is required');
      }
      
      // Create a new KEK version
      const newVersion = await client.createKEKVersion(reason);
      
      // Initialize with recovery phrase
      await client.initializeWithRecoveryPhrase(recoveryPhrase, [newVersion.id]);
      
      setSuccess('KEK version created successfully');
      setCreateDialogOpen(false);
      setReason('');
      setRecoveryPhrase('');
      
      // Refresh the list
      fetchKEKVersions();
    } catch (err) {
      console.error('Error creating KEK version:', err);
      setError(`Failed to create KEK version: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Rotate KEK
   */
  const handleRotateKEK = async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!reason) {
        throw new Error('Reason is required');
      }
      
      if (!recoveryPhrase) {
        throw new Error('Recovery phrase is required');
      }
      
      // Parse removed users
      const removedUsersList = removedUsers
        .split(',')
        .map(user => user.trim())
        .filter(user => user.length > 0);
      
      // Rotate KEK
      const newVersion = await client.rotateKEK(reason, removedUsersList);
      
      // Initialize with recovery phrase
      await client.initializeWithRecoveryPhrase(recoveryPhrase, [newVersion.id]);
      
      setSuccess('KEK rotated successfully');
      setRotateDialogOpen(false);
      setReason('');
      setRemovedUsers('');
      setRecoveryPhrase('');
      
      // Refresh the list
      fetchKEKVersions();
    } catch (err) {
      console.error('Error rotating KEK:', err);
      setError(`Failed to rotate KEK: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load KEK versions on mount
  useEffect(() => {
    if (client) {
      fetchKEKVersions();
    }
  }, [client]);
  
  if (!client) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading client...</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Key Encryption Key (KEK) Versions
        </Typography>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Create Version
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={() => setRotateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Rotate KEK
          </Button>
          
          <Tooltip title="Refresh">
            <IconButton onClick={fetchKEKVersions} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : kekVersions.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No KEK versions found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Version ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kekVersions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>{version.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={version.status}
                      color={
                        version.status === 'active'
                          ? 'success'
                          : version.status === 'decrypt-only'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{version.createdBy}</TableCell>
                  <TableCell>{new Date(version.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{version.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Create KEK Version Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New KEK Version</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="Recovery Phrase"
            type="password"
            value={recoveryPhrase}
            onChange={(e) => setRecoveryPhrase(e.target.value)}
            fullWidth
            margin="normal"
            required
            helperText="Enter your recovery phrase to initialize the new KEK version"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateKEKVersion}
            variant="contained"
            color="primary"
            disabled={!reason || !recoveryPhrase || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rotate KEK Dialog */}
      <Dialog open={rotateDialogOpen} onClose={() => setRotateDialogOpen(false)}>
        <DialogTitle>Rotate KEK</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="Removed Users"
            value={removedUsers}
            onChange={(e) => setRemovedUsers(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Comma-separated list of user IDs to remove"
          />
          
          <TextField
            label="Recovery Phrase"
            type="password"
            value={recoveryPhrase}
            onChange={(e) => setRecoveryPhrase(e.target.value)}
            fullWidth
            margin="normal"
            required
            helperText="Enter your recovery phrase to initialize the new KEK version"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRotateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRotateKEK}
            variant="contained"
            color="primary"
            disabled={!reason || !recoveryPhrase || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Rotate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KEKVersionList;
