import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../hooks/useConfig';
import axios from 'axios';
import { SerializedSecretShare } from '@neurallog/typescript-client-sdk';
import { SecureShareService } from '../../services/SecureShareService';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AdminPromotionFlowProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

/**
 * Admin Promotion Flow Component
 *
 * This component handles the process of promoting a user to admin,
 * with support for both immediate promotion (M=1) and multi-admin approval (M>1).
 */
const AdminPromotionFlow: React.FC<AdminPromotionFlowProps> = ({
  onComplete,
  onCancel
}) => {
  const { authUrl } = useConfig();
  const { client, splitKEKIntoShares, reconstructKEKFromShares, provisionKEKForUser } = useAuth();

  // Step state
  const [activeStep, setActiveStep] = useState(0);

  // User selection state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Approval settings state
  const [useMultiAdminApproval, setUseMultiAdminApproval] = useState(false);
  const [numAdmins, setNumAdmins] = useState(0);
  const [threshold, setThreshold] = useState(2);
  const [numShares, setNumShares] = useState(3);

  // Share collection state
  const [generatedShares, setGeneratedShares] = useState<SerializedSecretShare[]>([]);
  const [userPassword, setUserPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch admin count when users change
  useEffect(() => {
    const adminCount = users.filter(user => user.isAdmin).length;
    setNumAdmins(adminCount);

    // Set reasonable defaults based on admin count
    if (adminCount > 1) {
      setThreshold(Math.min(Math.ceil(adminCount / 2), adminCount));
      setNumShares(adminCount);
    } else {
      setThreshold(1);
      setNumShares(1);
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${authUrl}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedUser) {
      setError('Please select a user to promote');
      return;
    }

    if (activeStep === 1 && useMultiAdminApproval) {
      if (threshold < 2) {
        setError('Threshold must be at least 2 for multi-admin approval');
        return;
      }

      if (numShares < threshold) {
        setError('Number of shares must be at least equal to the threshold');
        return;
      }
    }

    setError(null);
    setActiveStep((prevStep) => prevStep + 1);

    // If moving to share generation step, generate shares
    if (activeStep === 1 && useMultiAdminApproval) {
      handleGenerateShares();
    }

    // If moving to final step with single admin approval, promote user immediately
    if (activeStep === 1 && !useMultiAdminApproval) {
      handlePromoteUser();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleGenerateShares = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!client) {
        throw new Error('Client not initialized');
      }

      if (!selectedUser) {
        throw new Error('No user selected');
      }

      if (!userPassword) {
        throw new Error('Password is required');
      }

      // First, upload the user's public key derived from their password
      await client.uploadUserPublicKey(userPassword);

      // Generate shares
      const shares = await splitKEKIntoShares(numShares, threshold);
      setGeneratedShares(shares);

      // If threshold is 1, we don't need to collect shares
      if (threshold === 1) {
        return;
      }

      // Get all admins
      const adminsResponse = await axios.get(`${authUrl}/users?isAdmin=true`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const admins = adminsResponse.data;
      const secureShareService = new SecureShareService(authUrl, client);

      // Get the current user's ID
      const currentUserId = client.getCurrentUserId();

      // Create a map to store encrypted shares for each admin
      const encryptedShares = new Map<string, string>();

      // For each admin (except the current user), encrypt a share
      for (let i = 0; i < Math.min(shares.length, admins.length); i++) {
        const admin = admins[i];

        // Skip the current user
        if (admin.id === currentUserId) {
          continue;
        }

        // Encrypt the share for this admin using their public key
        const encryptedShare = await secureShareService.encryptShareForAdmin(
          shares[i],
          admin.id
        );

        // Add to the map
        encryptedShares.set(admin.id, encryptedShare);
      }

      // Create the promotion request
      await secureShareService.createAdminPromotionRequest(
        selectedUser.id,
        selectedUser.username,
        encryptedShares
      );

      // Show success message
      setSuccess(true);
    } catch (err) {
      console.error('Error generating shares:', err);
      setError(`Failed to generate shares: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShare = () => {
    if (!shareInput) {
      setError('Please enter a share');
      return;
    }

    try {
      // Parse the share
      const share = JSON.parse(shareInput);

      // Validate the share format
      if (!share.x || !share.y) {
        throw new Error('Invalid share format');
      }

      // Check if share already exists
      if (collectedShares.some(s => s.x === share.x)) {
        setError('This share has already been added');
        return;
      }

      // Add the share
      setCollectedShares([...collectedShares, share]);
      setShareInput('');
      setError(null);

      // If we have enough shares, try to reconstruct the KEK
      if (collectedShares.length + 1 >= threshold) {
        handleReconstructKEK([...collectedShares, share]);
      }
    } catch (err) {
      console.error('Error adding share:', err);
      setError(`Invalid share format: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleReconstructKEK = async (shares: SerializedSecretShare[]) => {
    setLoading(true);
    setError(null);

    try {
      if (!client) {
        throw new Error('Client not initialized');
      }

      if (!selectedUser) {
        throw new Error('No user selected');
      }

      // Reconstruct the KEK
      await reconstructKEKFromShares(shares);

      // Promote the user
      await provisionKEKForUser(selectedUser.id, 'v1'); // Use the current KEK version

      setSuccess(true);

      // Call onComplete callback
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error reconstructing KEK:', err);
      setError(`Failed to reconstruct KEK: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!client) {
        throw new Error('Client not initialized');
      }

      if (!selectedUser) {
        throw new Error('No user selected');
      }

      // Promote the user directly (M=1 case)
      await provisionKEKForUser(selectedUser.id, 'v1'); // Use the current KEK version

      setSuccess(true);

      // Call onComplete callback
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error promoting user:', err);
      setError(`Failed to promote user: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShare = (index: number) => {
    if (index < generatedShares.length) {
      navigator.clipboard.writeText(JSON.stringify(generatedShares[index]));
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const filteredUsers = users.filter(user =>
    !user.isAdmin &&
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render steps
  const steps = [
    'Select User',
    'Configure Approval',
    useMultiAdminApproval ? 'Collect Shares' : 'Complete'
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Promote User to Admin
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          User successfully promoted to admin!
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {/* Step 1: Select User */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a User to Promote
            </Typography>

            <TextField
              label="Search Users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {filteredUsers.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                  No non-admin users found
                </Typography>
              ) : (
                filteredUsers.map((user) => (
                  <Paper
                    key={user.id}
                    elevation={selectedUser?.id === user.id ? 3 : 1}
                    sx={{
                      mb: 1,
                      p: 1,
                      cursor: 'pointer',
                      border: selectedUser?.id === user.id ? '1px solid' : 'none',
                      borderColor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => setSelectedUser(user)}
                  >
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.username}
                        secondary={`User ID: ${user.id}`}
                      />
                      {selectedUser?.id === user.id && (
                        <Chip
                          icon={<CheckIcon />}
                          label="Selected"
                          color="primary"
                          size="small"
                        />
                      )}
                    </ListItem>
                  </Paper>
                ))
              )}
            </List>
          </Box>
        )}

        {/* Step 2: Configure Approval */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Approval Process
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useMultiAdminApproval}
                    onChange={(e) => setUseMultiAdminApproval(e.target.checked)}
                  />
                }
                label="Require multiple admin approvals"
              />

              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {useMultiAdminApproval
                  ? "Multiple admins will need to approve this promotion using Shamir's Secret Sharing."
                  : "The user will be promoted immediately without requiring additional approvals."}
              </Typography>
            </Box>

            {useMultiAdminApproval && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Admins: {numAdmins}
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Approval Threshold (M)</InputLabel>
                  <Select
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    label="Approval Threshold (M)"
                  >
                    {Array.from({ length: numAdmins }, (_, i) => i + 1).map((num) => (
                      <MenuItem key={num} value={num}>
                        {num} {num === 1 ? 'Admin' : 'Admins'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Number of Shares (N)</InputLabel>
                  <Select
                    value={numShares}
                    onChange={(e) => setNumShares(Number(e.target.value))}
                    label="Number of Shares (N)"
                  >
                    {Array.from({ length: Math.max(numAdmins, threshold) }, (_, i) => i + threshold).map((num) => (
                      <MenuItem key={num} value={num}>
                        {num} Shares
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    This will generate {numShares} shares, and {threshold} of them will be required to promote the user.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        )}

        {/* Step 3: Collect Shares */}
        {activeStep === 2 && useMultiAdminApproval && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Admin Approval Process
            </Typography>

            {success ? (
              <Alert severity="success" sx={{ mb: 4 }}>
                <Typography variant="body1" fontWeight="bold">
                  Promotion Request Sent Successfully!
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Secure approval requests have been sent to {threshold - 1} other admins.
                  The promotion will be completed once {threshold - 1} admins approve the request.
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Secure Share Distribution
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Shares will be securely distributed to {threshold - 1} other admins.
                    Each admin will receive a notification to approve the promotion.
                  </Typography>
                </Alert>

                <TextField
                  label="Your Password"
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  helperText="Your password is required to generate secure shares"
                />

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Click "Send Approval Requests" to securely distribute shares to other admins.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}


          </Box>
        )}

        {/* Success Step */}
        {activeStep === 2 && !useMultiAdminApproval && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Promotion {loading ? 'In Progress' : (success ? 'Complete' : 'Failed')}
            </Typography>

            {loading ? (
              <CircularProgress size={60} sx={{ my: 3 }} />
            ) : success ? (
              <Box>
                <Avatar sx={{ width: 60, height: 60, mx: 'auto', bgcolor: 'success.main', mb: 2 }}>
                  <CheckIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="body1">
                  {selectedUser?.username} has been successfully promoted to admin.
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1" color="error">
                Failed to promote user. Please try again.
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          onClick={onCancel || (() => {})}
          disabled={loading}
        >
          {activeStep === steps.length - 1 ? 'Close' : 'Cancel'}
        </Button>

        <Box>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={loading || success}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
          )}

          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={loading || (activeStep === 0 && !selectedUser)}
            >
              Next
            </Button>
          )}

          {activeStep === steps.length - 1 && useMultiAdminApproval && !success && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateShares}
              disabled={loading || !userPassword}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Approval Requests'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPromotionFlow;
