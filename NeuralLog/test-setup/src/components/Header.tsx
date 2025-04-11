import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

const Header: React.FC = () => {
  return (
    <Box as="header" bg="blue.500" color="white" p={4}>
      <Heading size="md">My App</Heading>
    </Box>
  );
};

export default Header;
