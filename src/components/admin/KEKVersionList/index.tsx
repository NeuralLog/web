import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Autorenew as AutorenewIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { KEKVersionTable } from './KEKVersionTable';
import { CreateKEKDialog } from './CreateKEKDialog';
import { RotateKEKDialog } from './RotateKEKDialog';
import { ReencryptLogsDialog } from './ReencryptLogsDialog';

/**
 * Component for displaying and managing KEK versions
 */
const KEKVersionList: React.FC = () => {
  const { client } = useAuth();
  
  const [kekVersions, setKekVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false);
  const [reencryptDialogOpen, setReencryptDialogOpen] = useState(false);
  
  // Fetch KEK versions
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
  
  // Load KEK versions on mount
  useEffect(() => {
    if (client) {
      fetchKEKVersions();
    }
  }, [client]);
  
  // Handle dialog close with success message
  const handleSuccess = (message: string) => {
    setSuccess(message);
    fetchKEKVersions();
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 5000);
  };
  
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
            startIcon={<AutorenewIcon />}
            onClick={() => setRotateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Rotate KEK
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<KeyIcon />}
            onClick={() => setReencryptDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Re-encrypt Logs
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
      
      <KEKVersionTable 
        kekVersions={kekVersions} 
        loading={loading} 
      />
      
      <CreateKEKDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={(message) => {
          setCreateDialogOpen(false);
          handleSuccess(message);
        }}
      />
      
      <RotateKEKDialog
        open={rotateDialogOpen}
        onClose={() => setRotateDialogOpen(false)}
        onSuccess={(message) => {
          setRotateDialogOpen(false);
          handleSuccess(message);
        }}
      />
      
      <ReencryptLogsDialog
        open={reencryptDialogOpen}
        onClose={() => setReencryptDialogOpen(false)}
        onSuccess={(message) => {
          setReencryptDialogOpen(false);
          handleSuccess(message);
        }}
      />
    </Box>
  );
};

export default KEKVersionList;
