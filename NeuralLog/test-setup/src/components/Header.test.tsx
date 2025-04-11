// src/components/Header.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

// Mock the Chakra UI components
jest.mock('@chakra-ui/react', () => {
  return {
    Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
    Heading: ({ children, ...props }: any) => <h1 data-testid="heading" {...props}>{children}</h1>,
  };
});

describe('Header Component', () => {
  it('renders the header with app name', () => {
    render(<Header />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });
});
