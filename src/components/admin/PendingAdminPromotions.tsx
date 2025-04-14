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
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../hooks/useConfig';
import { SecureShareService, PendingAdminPromotion } from '../../services/SecureShareService';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

interface PendingAdminPromotionsProps {
  onApproved?: () => void;
}

/**
 * Component for displaying and handling pending admin promotions
 */
const PendingAdminPromotions: React.FC<PendingAdminPromotionsProps> = ({
  onApproved
}) => {
  const { authUrl } = useConfig();
  const { client, reconstructKEKFromShares, provisionKEKForUser } = useAuth();

  const [pendingPromotions, setPendingPromotions] = useState<PendingAdminPromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PendingAdminPromotion | null>(null);

  const secureShareService = new SecureShareService(authUrl, client);

  // Fetch pending promotions on component mount
  useEffect(() => {
    fetchPendingPromotions();
  }, []);

  const fetchPendingPromotions = async () => {
    setLoading(true);
    setError(null);

    try {
      const promotions = await secureShareService.getPendingPromotions();
      setPendingPromotions(promotions);
    } catch (err) {
      console.error('Error fetching pending promotions:', err);
      setError('Failed to fetch pending promotions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (promotion: PendingAdminPromotion) => {
    setSelectedPromotion(promotion);
    setPasswordDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPromotion || !password) return;

    setProcessingId(selectedPromotion.id);
    setError(null);

    try {
      if (!client) {
        throw new Error('Client not initialized');
      }

      // Get the encrypted share for this promotion
      const encryptedShareData = await secureShareService.getEncryptedShare(selectedPromotion.id);

      // Decrypt the share using the user's password
      const share = await secureShareService.decryptShare(encryptedShareData, password);

      // Approve the promotion on the server
      await secureShareService.approvePromotion(selectedPromotion.id);

      // Reconstruct the KEK from the share
      await reconstructKEKFromShares([share]);

      // Provision the KEK for the new admin
      await provisionKEKForUser(selectedPromotion.candidateId, 'v1'); // Use the current KEK version

      // Reset state
      setPassword('');
      setPasswordDialogOpen(false);
      setSelectedPromotion(null);

      // Refresh the list
      await fetchPendingPromotions();

      // Call the onApproved callback
      if (onApproved) {
        onApproved();
      }
    } catch (err) {
      console.error('Error approving promotion:', err);
      setError(`Failed to approve promotion: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (promotion: PendingAdminPromotion) => {
    setProcessingId(promotion.id);
    setError(null);

    try {
      // Reject the promotion
      await secureShareService.rejectPromotion(promotion.id);

      // Refresh the list
      await fetchPendingPromotions();
    } catch (err) {
      console.error('Error rejecting promotion:', err);
      setError(`Failed to reject promotion: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Pending Admin Promotions
          </Typography>

          <Tooltip title="Refresh">
            <IconButton onClick={fetchPendingPromotions} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : pendingPromotions.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No pending admin promotions
            </Typography>
          </Paper>
        ) : (
          <List>
            {pendingPromotions.map((promotion) => (
              <Paper key={promotion.id} variant="outlined" sx={{ mb: 2 }}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="Approve">
                        <IconButton
                          edge="end"
                          color="success"
                          onClick={() => handleApproveClick(promotion)}
                          disabled={processingId === promotion.id}
                          sx={{ mr: 1 }}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleReject(promotion)}
                          disabled={processingId === promotion.id}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          Promote {promotion.candidateName}
                        </Typography>
                        <Chip
                          label="Pending"
                          color="warning"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          Requested by {promotion.requesterName} on {new Date(promotion.timestamp).toLocaleString()}
                        </Typography>
                        {processingId === promotion.id && (
                          <Box sx={{ mt: 1 }}>
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            <Typography variant="body2" component="span" color="primary">
                              Processing...
                            </Typography>
                          </Box>
                        )}
                      </>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Box>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Enter Your Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Your password is required to decrypt the share for this promotion.
          </Typography>
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="primary"
            disabled={!password}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PendingAdminPromotions;
