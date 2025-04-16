import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

interface InitiateRecoveryStepProps {
  onInitiate: (sessionData: any) => void;
  loading: boolean;
}

/**
 * Component for the initiate recovery step
 */
export const InitiateRecoveryStep: React.FC<InitiateRecoveryStepProps> = ({ onInitiate, loading }) => {
  const { client } = useAuth();
  
  const [kekVersions, setKekVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [threshold, setThreshold] = useState(3);
  const [reason, setReason] = useState('');
  const [fetchingVersions, setFetchingVersions] = useState(false);
  
  // Fetch KEK versions on mount
  useEffect(() => {
    if (client) {
      fetchKEKVersions();
    }
  }, [client]);
  
  const fetchKEKVersions = async () => {
    if (!client) return;
    
    setFetchingVersions(true);
    
    try {
      const versions = await client.getKEKVersions();
      setKekVersions(versions);
      
      if (versions.length > 0) {
        setSelectedVersion(versions[0].id);
      }
    } catch (err) {
      console.error('Error fetching KEK versions:', err);
    } finally {
      setFetchingVersions(false);
    }
  };
  
  const handleVersionChange = (event: SelectChangeEvent<string>) => {
    setSelectedVersion(event.target.value);
  };
  
  const handleThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setThreshold(value);
    }
  };
  
  const handleInitiate = () => {
    // Create recovery session data
    const sessionData = {
      id: `recovery-${Date.now()}`,
      versionId: selectedVersion,
      threshold,
      reason,
      status: 'pending',
      shares: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
    };
    
    onInitiate(sessionData);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Initiate KEK Recovery
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        To recover a KEK, you need to specify which KEK version to recover, the threshold number of shares required, and a reason for the recovery.
      </Typography>
      
      <FormControl fullWidth margin="normal" disabled={fetchingVersions || loading}>
        <InputLabel id="kek-version-select-label">KEK Version</InputLabel>
        <Select
          labelId="kek-version-select-label"
          value={selectedVersion}
          onChange={handleVersionChange}
          label="KEK Version"
        >
          {kekVersions.map((version) => (
            <MenuItem key={version.id} value={version.id}>
              {version.id} ({version.status})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <TextField
        margin="normal"
        label="Threshold"
        type="number"
        fullWidth
        value={threshold}
        onChange={handleThresholdChange}
        disabled={loading}
        helperText="Number of shares required to recover the KEK"
        inputProps={{ min: 1 }}
      />
      
      <TextField
        margin="normal"
        label="Reason"
        fullWidth
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={loading}
        helperText="Reason for recovering the KEK"
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleInitiate}
          disabled={!selectedVersion || !reason || loading || fetchingVersions}
        >
          {loading ? <CircularProgress size={24} /> : 'Initiate Recovery'}
        </Button>
      </Box>
    </Box>
  );
};
