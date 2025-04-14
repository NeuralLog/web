import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  TextField,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface KEKVersionRecoveryProps {
  onComplete?: (versions: string[]) => void;
  onCancel?: () => void;
}

/**
 * KEK Version Recovery Component
 * 
 * This component allows users to recover KEK versions from their master secret.
 * It's used when logs in the database are encrypted with different KEK versions.
 */
const KEKVersionRecovery: React.FC<KEKVersionRecoveryProps> = ({
  onComplete,
  onCancel
}) => {
  const { client } = useAuth();
  
  const [versions, setVersions] = useState<string[]>(['v1']);
  const [newVersion, setNewVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recoveredVersions, setRecoveredVersions] = useState<string[]>([]);
  
  const handleAddVersion = () => {
    if (!newVersion) return;
    
    if (versions.includes(newVersion)) {
      setError(`Version "${newVersion}" already added`);
      return;
    }
    
    setVersions([...versions, newVersion]);
    setNewVersion('');
    setError(null);
  };
  
  const handleRemoveVersion = (version: string) => {
    setVersions(versions.filter(v => v !== version));
  };
  
  const handleRecover = async () => {
    if (!client) {
      setError('Client not initialized');
      return;
    }
    
    if (versions.length === 0) {
      setError('Please add at least one KEK version to recover');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Recover KEK versions
      const success = await client.recoverKEKVersions(versions);
      
      if (success) {
        setSuccess(true);
        setRecoveredVersions([...versions]);
        
        if (onComplete) {
          onComplete(versions);
        }
      } else {
        setError('Failed to recover KEK versions');
      }
    } catch (err) {
      console.error('KEK version recovery failed:', err);
      setError(`Recovery failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recover KEK Versions
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Logs in the database may be encrypted with different KEK versions.
        Add the versions you want to recover to access logs encrypted with those versions.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Successfully recovered {recoveredVersions.length} KEK version(s)
        </Alert>
      )}
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            label="KEK Version"
            value={newVersion}
            onChange={(e) => setNewVersion(e.target.value)}
            placeholder="e.g., v2"
            size="small"
            fullWidth
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddVersion}
            disabled={!newVersion}
          >
            Add
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Versions to Recover:
        </Typography>
        
        {versions.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ my: 2 }}>
            No versions added yet
          </Typography>
        ) : (
          <List dense>
            {versions.map((version) => (
              <ListItem
                key={version}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleRemoveVersion(version)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={version} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {recoveredVersions.includes(version) && "✓ Recovered"}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        {onCancel && (
          <Button onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleRecover}
          disabled={loading || versions.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Recover KEK Versions'}
        </Button>
      </Box>
    </Box>
  );
};

export default KEKVersionRecovery;
