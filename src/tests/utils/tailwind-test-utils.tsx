import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Simple render function - no providers needed for Tailwind + Headless UI
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, options);

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
