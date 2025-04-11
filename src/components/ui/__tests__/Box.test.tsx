import React from 'react';
import { render, screen } from '../../../tests/utils/tailwind-test-utils';
import { Box } from '../Box';

describe('Box', () => {
  it('renders children correctly', () => {
    render(<Box>Box Content</Box>);
    expect(screen.getByText('Box Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Box className="test-class">Box Content</Box>);
    const box = screen.getByText('Box Content');
    expect(box).toBeInTheDocument();
  });

  it('renders with custom element type', () => {
    render(<Box as="section">Box Content</Box>);
    const box = screen.getByText('Box Content');
    expect(box).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Box ref={ref}>Box Content</Box>);
    expect(ref.current).not.toBeNull();
  });

  it('passes through HTML attributes', () => {
    render(<Box data-testid="test-box" aria-label="Box Label">Box Content</Box>);
    const box = screen.getByText('Box Content');
    expect(box).toBeInTheDocument();
  });
});
