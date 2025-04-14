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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component for managing KEK blobs
 */
const KEKBlobManager: React.FC = () => {
  const { client } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [kekVersions, setKekVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog state
  const [provisionDialogOpen, setProvisionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedKEKVersion, setSelectedKEKVersion] = useState('');
  
  /**
   * Fetch users
   */
  const fetchUsers = async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedUsers = await client.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to fetch users: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
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
   * Provision KEK for a user
   */
  const handleProvisionKEK = async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!selectedUser) {
        throw new Error('User is required');
      }
      
      if (!selectedKEKVersion) {
        throw new Error('KEK version is required');
      }
      
      // Provision KEK for user
      await client.provisionKEKForUser(selectedUser, selectedKEKVersion);
      
      setSuccess('KEK provisioned successfully');
      setProvisionDialogOpen(false);
      setSelectedUser('');
      setSelectedKEKVersion('');
    } catch (err) {
      console.error('Error provisioning KEK:', err);
      setError(`Failed to provision KEK: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    if (client) {
      fetchUsers();
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
          KEK Blob Management
        </Typography>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<KeyIcon />}
            onClick={() => setProvisionDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Provision KEK
          </Button>
          
          <Tooltip title="Refresh">
            <IconButton 
              onClick={() => {
                fetchUsers();
                fetchKEKVersions();
              }} 
              disabled={loading}
            >
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
      ) : users.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No users found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Tooltip title="Provision KEK">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedUser(user.id);
                          setProvisionDialogOpen(true);
                        }}
                        size="small"
                      >
                        <KeyIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Provision KEK Dialog */}
      <Dialog open={provisionDialogOpen} onClose={() => setProvisionDialogOpen(false)}>
        <DialogTitle>Provision KEK for User</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="user-select-label">User</InputLabel>
            <Select
              labelId="user-select-label"
              value={selectedUser}
              onChange={(e: SelectChangeEvent) => setSelectedUser(e.target.value)}
              label="User"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="kek-version-select-label">KEK Version</InputLabel>
            <Select
              labelId="kek-version-select-label"
              value={selectedKEKVersion}
              onChange={(e: SelectChangeEvent) => setSelectedKEKVersion(e.target.value)}
              label="KEK Version"
            >
              {kekVersions
                .filter(version => version.status === 'active')
                .map((version) => (
                  <MenuItem key={version.id} value={version.id}>
                    {version.id} (Created: {new Date(version.createdAt).toLocaleString()})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProvisionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleProvisionKEK}
            variant="contained"
            color="primary"
            disabled={!selectedUser || !selectedKEKVersion || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Provision'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KEKBlobManager;
