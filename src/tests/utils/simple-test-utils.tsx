import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Simple render function that wraps components with a basic wrapper
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="simple-test-wrapper">{children}</div>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
