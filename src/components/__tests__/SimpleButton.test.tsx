import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Create a simple button component for testing
const SimpleButton = ({ label, onClick }: { label: string; onClick?: () => void }) => {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
};

describe('SimpleButton', () => {
  it('renders with the correct label', () => {
    render(<SimpleButton label="Click Me" />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<SimpleButton label="Click Me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
