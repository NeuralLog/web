import React, { useState } from 'react';
import {
  Box,
  Tab,
  Tabs
} from '@mui/material';
import { KEKVersionList } from './index';
import { KEKBlobManager } from './index';

/**
 * Component for managing KEK versions
 */
const KEKManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="KEK Versions" />
          <Tab label="User KEK Management" />
        </Tabs>
      </Box>

      {tabValue === 0 && <KEKVersionList />}
      {tabValue === 1 && <KEKBlobManager />}
    </Box>
  );
};

export default KEKManagement;
