import React from 'react';
import { render, screen } from '@testing-library/react';
import SimpleComponent from './SimpleComponent';

describe('SimpleComponent', () => {
  it('renders the component with text', () => {
    render(<SimpleComponent />);
    
    expect(screen.getByText('Simple Component')).toBeInTheDocument();
    expect(screen.getByText('This is a simple component without Chakra UI')).toBeInTheDocument();
  });
});
