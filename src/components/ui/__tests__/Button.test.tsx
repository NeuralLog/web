import React from 'react';
import { render, screen, fireEvent } from '../../../tests/utils/tailwind-test-utils';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with the correct label', () => {
    render(<Button label="Click Me" />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct variant class', () => {
    render(<Button label="Click Me" variant="destructive" />);
    const button = screen.getByText('Click Me');
    
    expect(button).toHaveClass('bg-red-500');
  });

  it('applies the correct size class', () => {
    render(<Button label="Click Me" size="lg" />);
    const button = screen.getByText('Click Me');
    
    expect(button).toHaveClass('h-12');
  });

  it('can render children instead of label', () => {
    render(
      <Button>
        <span>Child Element</span>
      </Button>
    );
    
    expect(screen.getByText('Child Element')).toBeInTheDocument();
  });
});
