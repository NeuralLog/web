'use client';

import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { AuthDemo } from '@/components/AuthDemo';

export default function AuthDemoPage() {
  return (
    <Box>
      <Heading mb={4}>Auth SDK Demo</Heading>
      <Text mb={6}>
        This page demonstrates the capabilities of the NeuralLog Auth SDK.
        You can check, grant, and revoke permissions, as well as manage tenant membership.
      </Text>
      
      <AuthDemo />
    </Box>
  );
}
