import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  LinearProgress
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

interface ReencryptLogsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Dialog for re-encrypting logs with a new KEK version
 */
export const ReencryptLogsDialog: React.FC<ReencryptLogsDialogProps> = ({ open, onClose, onSuccess }) => {
  const { client } = useAuth();
  
  const [kekVersions, setKekVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [availableLogs, setAvailableLogs] = useState<string[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Fetch KEK versions and logs when dialog opens
  useEffect(() => {
    if (open && client) {
      fetchData();
    }
  }, [open, client]);
  
  const fetchData = async () => {
    if (!client) return;
    
    setFetchingData(true);
    setError(null);
    
    try {
      // Fetch KEK versions and logs in parallel
      const [versions, logs] = await Promise.all([
        client.getKEKVersions(),
        client.getLogNames()
      ]);
      
      setKekVersions(versions);
      setAvailableLogs(logs);
      
      // Set the active version as the selected version
      const activeVersion = versions.find(v => v.status === 'active');
      if (activeVersion) {
        setSelectedVersion(activeVersion.id);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setFetchingData(false);
    }
  };
  
  const handleVersionChange = (event: SelectChangeEvent<string>) => {
    setSelectedVersion(event.target.value);
  };
  
  const handleLogsChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedLogs(event.target.value as string[]);
  };
  
  const handleReencryptLogs = async () => {
    if (!client || !selectedVersion || selectedLogs.length === 0) return;
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Re-encrypt logs one by one to show progress
      for (let i = 0; i < selectedLogs.length; i++) {
        const logName = selectedLogs[i];
        
        // Update progress
        setProgress(Math.round((i / selectedLogs.length) * 100));
        
        // Re-encrypt the log
        await client.reencryptLogs([logName], selectedVersion);
      }
      
      setProgress(100);
      onSuccess('Logs re-encrypted successfully');
      setSelectedLogs([]);
    } catch (err) {
      console.error('Error re-encrypting logs:', err);
      setError(`Failed to re-encrypt logs: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setSelectedLogs([]);
    setError(null);
    setProgress(0);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Re-encrypt Logs</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Re-encrypting logs will update them to use the selected KEK version. This process may take some time depending on the number of logs.
          </Typography>
        </Box>
        
        {fetchingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
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
            
            <FormControl fullWidth margin="dense">
              <InputLabel id="logs-select-label">Logs to Re-encrypt</InputLabel>
              <Select
                labelId="logs-select-label"
                multiple
                value={selectedLogs}
                onChange={handleLogsChange}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                {availableLogs.map((log) => (
                  <MenuItem key={log} value={log}>
                    <Checkbox checked={selectedLogs.indexOf(log) > -1} />
                    <ListItemText primary={log} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
        
        {loading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Re-encrypting logs: {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleReencryptLogs}
          color="primary"
          disabled={!selectedVersion || selectedLogs.length === 0 || loading || fetchingData}
        >
          {loading ? <CircularProgress size={24} /> : 'Re-encrypt'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
