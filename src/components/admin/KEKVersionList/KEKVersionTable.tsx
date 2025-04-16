import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip
} from '@mui/material';

interface KEKVersionTableProps {
  kekVersions: any[];
  loading: boolean;
}

/**
 * Component for displaying KEK versions in a table
 */
export const KEKVersionTable: React.FC<KEKVersionTableProps> = ({ kekVersions, loading }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          ) : kekVersions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No KEK versions found
              </TableCell>
            </TableRow>
          ) : (
            kekVersions.map((version) => (
              <TableRow key={version.id}>
                <TableCell>{version.id}</TableCell>
                <TableCell>{new Date(version.createdAt).toLocaleString()}</TableCell>
                <TableCell>{version.createdBy}</TableCell>
                <TableCell>
                  <Chip
                    label={version.status}
                    color={version.status === 'active' ? 'success' : version.status === 'decrypt-only' ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>{version.reason}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
