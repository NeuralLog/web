import React from 'react';
import { render, screen, fireEvent } from '../../tests/utils/tailwind-test-utils';
import { TailwindButton } from '../TailwindButton';

describe('TailwindButton', () => {
  it('renders with the correct label', () => {
    render(<TailwindButton label="Click Me" />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<TailwindButton label="Click Me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct variant class', () => {
    render(<TailwindButton label="Click Me" variant="destructive" />);
    const button = screen.getByText('Click Me');
    
    expect(button).toHaveClass('bg-red-500');
  });
});
