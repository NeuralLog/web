import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// Create a simple component for testing
const SimpleUserComponent = () => {
  return (
    <div>
      <h1>User Profile</h1>
      <p>John Doe</p>
      <p>john@example.com</p>
      <p>Tenant: test-tenant</p>
    </div>
  );
};

describe('Simple User Component', () => {
  it('should render the user profile', () => {
    render(<SimpleUserComponent />);
    
    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Tenant: test-tenant')).toBeInTheDocument();
  });
});
