import React from 'react';
import { render, screen, fireEvent } from '../../tests/utils/test-utils';
import { Button } from '../ui/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="default">Brand Button</Button>);
    const button = screen.getByRole('button');

    // Check that the button has the correct Tailwind classes
    expect(button).toHaveClass('bg-brand-500');
    expect(button).toHaveClass('text-white');
  });
});
