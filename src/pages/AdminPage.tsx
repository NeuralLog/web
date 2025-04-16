import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Key as KeyIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../hooks/useConfig';
import axios from 'axios';
import { AdminPromotionFlow, PendingAdminPromotions, KEKManagement } from '../components/admin';
import KEKVersionList from '../components/admin/KEKVersionList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

interface KekVersion {
  id: string;
  version: number;
  createdAt: string;
  isActive: boolean;
}

/**
 * Admin Page
 */
const AdminPage: React.FC = () => {
  const { authUrl } = useConfig();
  const { client, provisionKEKForUser, splitKEKIntoShares } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [kekVersions, setKekVersions] = useState<KekVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [provisionKEKDialog, setProvisionKEKDialog] = useState(false);
  const [shareKEKDialog, setShareKEKDialog] = useState(false);
  const [promoteAdminDialog, setPromoteAdminDialog] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    isAdmin: false
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedKekVersion, setSelectedKekVersion] = useState<KekVersion | null>(null);
  const [shareSettings, setShareSettings] = useState({
    numShares: 3,
    threshold: 2
  });
  const [shares, setShares] = useState<any[]>([]);

  // Fetch users and KEK versions
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch users
      const usersResponse = await axios.get(`${authUrl}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setUsers(usersResponse.data);

      // Fetch KEK versions
      const kekVersionsResponse = await axios.get(`${authUrl}/kek/versions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setKekVersions(kekVersionsResponse.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [authUrl]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddUser = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create user
      const response = await axios.post(
        `${authUrl}/users`,
        {
          username: newUser.username,
          password: newUser.password,
          is_admin: newUser.isAdmin
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      // Add new user to the list
      setUsers([...users, response.data]);

      // Close dialog
      setAddUserDialog(false);

      // Reset form
      setNewUser({
        username: '',
        password: '',
        isAdmin: false
      });
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProvisionKEK = async () => {
    if (!selectedUser || !selectedKekVersion || !client) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await provisionKEKForUser(selectedUser.id, selectedKekVersion.id);

      // Close dialog
      setProvisionKEKDialog(false);

      // Reset selection
      setSelectedUser(null);
      setSelectedKekVersion(null);
    } catch (err) {
      console.error('Error provisioning KEK:', err);
      setError('Failed to provision KEK. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareKEK = async () => {
    setLoading(true);
    setError(null);

    try {
      const generatedShares = await splitKEKIntoShares(
        shareSettings.numShares,
        shareSettings.threshold
      );

      setShares(generatedShares);
    } catch (err) {
      console.error('Error sharing KEK:', err);
      setError('Failed to share KEK. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${authUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      // Remove user from the list
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Users" />
            <Tab label="KEK Management" />
          </Tabs>

          {/* Users Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AdminIcon />}
                onClick={() => setPromoteAdminDialog(true)}
                color="secondary"
              >
                Promote to Admin
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddUserDialog(true)}
              >
                Add User
              </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
              <PendingAdminPromotions onApproved={fetchData} />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Chip label="Admin" color="primary" size="small" />
                          ) : (
                            <Chip label="User" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setSelectedUser(user);
                              setProvisionKEKDialog(true);
                            }}
                            title="Provision KEK"
                          >
                            <KeyIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* KEK Management Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <KEKVersionList />
              <KEKManagement />
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Add User Dialog */}
      <Dialog open={addUserDialog} onClose={() => setAddUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newUser.isAdmin ? 'admin' : 'user'}
              onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.value === 'admin' })}
              label="Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            color="primary"
            disabled={loading || !newUser.username || !newUser.password}
          >
            {loading ? <CircularProgress size={24} /> : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Provision KEK Dialog */}
      <Dialog open={provisionKEKDialog} onClose={() => setProvisionKEKDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Provision KEK for User</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Provisioning a KEK for a user allows them to decrypt logs.
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>User</InputLabel>
            <Select
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const user = users.find(u => u.id === e.target.value);
                setSelectedUser(user || null);
              }}
              label="User"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>KEK Version</InputLabel>
            <Select
              value={selectedKekVersion?.id || ''}
              onChange={(e) => {
                const version = kekVersions.find(v => v.id === e.target.value);
                setSelectedKekVersion(version || null);
              }}
              label="KEK Version"
            >
              {kekVersions.map((version) => (
                <MenuItem key={version.id} value={version.id}>
                  Version {version.version} {version.isActive ? '(Active)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProvisionKEKDialog(false)}>Cancel</Button>
          <Button
            onClick={handleProvisionKEK}
            variant="contained"
            color="primary"
            disabled={loading || !selectedUser || !selectedKekVersion}
          >
            {loading ? <CircularProgress size={24} /> : 'Provision KEK'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share KEK Dialog */}
      <Dialog open={shareKEKDialog} onClose={() => setShareKEKDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Share KEK Using Shamir's Secret Sharing</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Split your KEK into multiple shares using Shamir's Secret Sharing.
            This allows you to recover your KEK if you lose your recovery password.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Number of Shares"
              type="number"
              value={shareSettings.numShares}
              onChange={(e) => setShareSettings({
                ...shareSettings,
                numShares: parseInt(e.target.value)
              })}
              inputProps={{ min: 2 }}
              fullWidth
            />

            <TextField
              label="Threshold"
              type="number"
              value={shareSettings.threshold}
              onChange={(e) => setShareSettings({
                ...shareSettings,
                threshold: parseInt(e.target.value)
              })}
              inputProps={{ min: 2, max: shareSettings.numShares }}
              fullWidth
              helperText={`At least ${shareSettings.threshold} shares are needed to reconstruct the KEK`}
            />
          </Box>

          {shares.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generated Shares
              </Typography>

              <Alert severity="warning" sx={{ mb: 2 }}>
                Store these shares securely. They will only be shown once.
              </Alert>

              <Stack spacing={1}>
                {shares.map((share, index) => (
                  <Paper key={index} sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      Share {index + 1}: {JSON.stringify(share)}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareKEKDialog(false)}>Close</Button>
          {shares.length === 0 && (
            <Button
              onClick={handleShareKEK}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Shares'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Promote Admin Dialog */}
      <Dialog open={promoteAdminDialog} onClose={() => setPromoteAdminDialog(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <AdminPromotionFlow
            onComplete={() => {
              setPromoteAdminDialog(false);
              // Refresh the user list
              fetchData();
            }}
            onCancel={() => setPromoteAdminDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AdminPage;
