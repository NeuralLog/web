import React, { useState, useEffect } from 'react';
import { useNeuralLog } from '@/contexts/NeuralLogContext';

// Use client-side only imports for Material UI
let Box: any;
let Typography: any;
let Card: any;
let CardContent: any;
let Button: any;
let CircularProgress: any;
let Alert: any;
let FormControl: any;
let InputLabel: any;
let Select: any;
let MenuItem: any;
let TextField: any;
let Grid: any;
let Divider: any;
let Paper: any;
let Table: any;
let TableBody: any;
let TableCell: any;
let TableContainer: any;
let TableHead: any;
let TableRow: any;

// Import Material UI components only on the client side
if (typeof window !== 'undefined') {
  const mui = require('@mui/material');
  Box = mui.Box;
  Typography = mui.Typography;
  Card = mui.Card;
  CardContent = mui.CardContent;
  Button = mui.Button;
  CircularProgress = mui.CircularProgress;
  Alert = mui.Alert;
  FormControl = mui.FormControl;
  InputLabel = mui.InputLabel;
  Select = mui.Select;
  MenuItem = mui.MenuItem;
  TextField = mui.TextField;
  Grid = mui.Grid;
  Divider = mui.Divider;
  Paper = mui.Paper;
  Table = mui.Table;
  TableBody = mui.TableBody;
  TableCell = mui.TableCell;
  TableContainer = mui.TableContainer;
  TableHead = mui.TableHead;
  TableRow = mui.TableRow;
}

// Helper function to format retention period
const formatRetentionPeriod = (ms: number): string => {
  if (ms === -1) return 'Indefinitely';

  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (days >= 365) {
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  } else if (days >= 1) {
    return `${Math.floor(days)} ${Math.floor(days) === 1 ? 'day' : 'days'}`;
  } else if (hours >= 1) {
    return `${Math.floor(hours)} ${Math.floor(hours) === 1 ? 'hour' : 'hours'}`;
  } else if (minutes >= 1) {
    return `${Math.floor(minutes)} ${Math.floor(minutes) === 1 ? 'minute' : 'minutes'}`;
  } else {
    return `${Math.floor(seconds)} ${Math.floor(seconds) === 1 ? 'second' : 'seconds'}`;
  }
};

// Helper function to convert time unit to milliseconds
const timeUnitToMs = (value: number, unit: string): number => {
  switch (unit) {
    case 'seconds':
      return value * 1000;
    case 'minutes':
      return value * 60 * 1000;
    case 'hours':
      return value * 60 * 60 * 1000;
    case 'days':
      return value * 24 * 60 * 60 * 1000;
    case 'months':
      return value * 30 * 24 * 60 * 60 * 1000;
    case 'years':
      return value * 365 * 24 * 60 * 60 * 1000;
    default:
      return value;
  }
};

/**
 * Component for managing retention policies
 */
const RetentionPolicySettings: React.FC = () => {
  const { client } = useNeuralLog();

  // State for default policy
  const [defaultPolicy, setDefaultPolicy] = useState<any>(null);
  const [newDefaultRetentionValue, setNewDefaultRetentionValue] = useState<number>(30);
  const [newDefaultRetentionUnit, setNewDefaultRetentionUnit] = useState<string>('days');

  // State for log-specific policies
  const [logPolicies, setLogPolicies] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<string>('');
  const [newLogRetentionValue, setNewLogRetentionValue] = useState<number>(30);
  const [newLogRetentionUnit, setNewLogRetentionUnit] = useState<string>('days');

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [affectedLogs, setAffectedLogs] = useState<number | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (client) {
      loadData();
    }
  }, [client]);

  // Load all data (default policy, log-specific policies, and logs)
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load default policy
      const policy = await client.getRetentionPolicy();
      setDefaultPolicy(policy);

      // Load all logs
      const logsResponse = await client.getLogs();
      setLogs(logsResponse.map((log: any) => log.name));

      // Load all policies
      const policies = await client.getAllRetentionPolicies();
      setLogPolicies(policies.filter((p: any) => p.logName));
    } catch (err) {
      setError(`Failed to load retention policies: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Update default policy
  const updateDefaultPolicy = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const retentionPeriodMs = timeUnitToMs(newDefaultRetentionValue, newDefaultRetentionUnit);
      await client.setRetentionPolicy(retentionPeriodMs);
      setSuccess('Default retention policy updated successfully');
      loadData(); // Reload data
    } catch (err) {
      setError(`Failed to update default policy: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Check impact of default policy change
  const checkDefaultPolicyImpact = async () => {
    setLoading(true);
    setError(null);

    try {
      const retentionPeriodMs = timeUnitToMs(newDefaultRetentionValue, newDefaultRetentionUnit);
      const count = await client.getExpiredLogsCount(retentionPeriodMs);
      setAffectedLogs(count);
    } catch (err) {
      setError(`Failed to check impact: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Set log-specific policy
  const setLogPolicy = async () => {
    if (!selectedLog) {
      setError('Please select a log');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const retentionPeriodMs = timeUnitToMs(newLogRetentionValue, newLogRetentionUnit);
      await client.setRetentionPolicy(retentionPeriodMs, selectedLog);
      setSuccess(`Retention policy for "${selectedLog}" updated successfully`);
      loadData(); // Reload data
    } catch (err) {
      setError(`Failed to set log policy: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete log-specific policy
  const deleteLogPolicy = async (logName: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await client.deleteRetentionPolicy(logName);
      setSuccess(`Retention policy for "${logName}" deleted successfully`);
      loadData(); // Reload data
    } catch (err) {
      setError(`Failed to delete log policy: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Data Retention Policies
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading && !defaultPolicy && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Default Retention Policy */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Default Retention Policy
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            This policy applies to all logs that don't have a specific retention policy.
          </Typography>

          {defaultPolicy && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                Current Policy:
              </Typography>
              <Typography>
                Logs are retained for {formatRetentionPeriod(defaultPolicy.retentionPeriodMs)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Update Default Policy
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Retention Period"
                type="number"
                value={newDefaultRetentionValue}
                onChange={(e) => setNewDefaultRetentionValue(Number(e.target.value))}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Time Unit</InputLabel>
                <Select
                  value={newDefaultRetentionUnit}
                  onChange={(e) => setNewDefaultRetentionUnit(e.target.value)}
                  label="Time Unit"
                >
                  <MenuItem value="seconds">Seconds</MenuItem>
                  <MenuItem value="minutes">Minutes</MenuItem>
                  <MenuItem value="hours">Hours</MenuItem>
                  <MenuItem value="days">Days</MenuItem>
                  <MenuItem value="months">Months</MenuItem>
                  <MenuItem value="years">Years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={checkDefaultPolicyImpact}
                  disabled={loading}
                >
                  Check Impact
                </Button>
                <Button
                  variant="contained"
                  onClick={updateDefaultPolicy}
                  disabled={loading}
                >
                  Update
                </Button>
              </Box>
            </Grid>
          </Grid>

          {affectedLogs !== null && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This change will affect {affectedLogs} log entries.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Log-Specific Retention Policies */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Log-Specific Retention Policies
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Set different retention periods for specific logs. These override the default policy.
          </Typography>

          {/* Existing Log Policies */}
          {logPolicies.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Log-Specific Policies:
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Log Name</TableCell>
                      <TableCell>Retention Period</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logPolicies.map((policy) => (
                      <TableRow key={policy.logName}>
                        <TableCell>{policy.logName}</TableCell>
                        <TableCell>{formatRetentionPeriod(policy.retentionPeriodMs)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => deleteLogPolicy(policy.logName)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Add/Update Log-Specific Policy
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Select Log</InputLabel>
                <Select
                  value={selectedLog}
                  onChange={(e) => setSelectedLog(e.target.value)}
                  label="Select Log"
                >
                  {logs.map((log) => (
                    <MenuItem key={log} value={log}>
                      {log}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Retention Period"
                type="number"
                value={newLogRetentionValue}
                onChange={(e) => setNewLogRetentionValue(Number(e.target.value))}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Time Unit</InputLabel>
                <Select
                  value={newLogRetentionUnit}
                  onChange={(e) => setNewLogRetentionUnit(e.target.value)}
                  label="Time Unit"
                >
                  <MenuItem value="seconds">Seconds</MenuItem>
                  <MenuItem value="minutes">Minutes</MenuItem>
                  <MenuItem value="hours">Hours</MenuItem>
                  <MenuItem value="days">Days</MenuItem>
                  <MenuItem value="months">Months</MenuItem>
                  <MenuItem value="years">Years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                onClick={setLogPolicy}
                disabled={loading || !selectedLog}
                fullWidth
              >
                Set Policy
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RetentionPolicySettings;
