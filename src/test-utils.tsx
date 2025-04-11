import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Simple test utils without Chakra UI
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

export * from '@testing-library/react';
export { customRender as render };
