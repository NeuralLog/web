// src/tests/utils/test-utils.tsx

import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react';
import { render, RenderOptions } from '@testing-library/react';
import React from 'react';

// Create a simple wrapper without a theme
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChakraProvider>
      {children}
    </ChakraProvider>
  );
};

// This is where the magic happens!

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
