import React from 'react';
import { render, screen } from '../../../tests/utils/tailwind-test-utils';
import { Text } from '../Text';

describe('Text', () => {
  it('renders children correctly', () => {
    render(<Text>Text Content</Text>);
    expect(screen.getByText('Text Content')).toBeInTheDocument();
  });

  it('applies variant class correctly', () => {
    render(<Text variant="muted">Text Content</Text>);
    const text = screen.getByText('Text Content');
    expect(text).toHaveClass('text-gray-500');
  });

  it('applies size class correctly', () => {
    render(<Text size="lg">Text Content</Text>);
    const text = screen.getByText('Text Content');
    expect(text).toHaveClass('text-lg');
  });

  it('applies weight class correctly', () => {
    render(<Text weight="bold">Text Content</Text>);
    const text = screen.getByText('Text Content');
    expect(text).toHaveClass('font-bold');
  });

  it('applies custom className', () => {
    render(<Text className="test-class">Text Content</Text>);
    const text = screen.getByText('Text Content');
    expect(text).toHaveClass('test-class');
  });

  it('renders with custom element type', () => {
    render(<Text as="span">Text Content</Text>);
    const text = screen.getByText('Text Content');
    expect(text.tagName).toBe('SPAN');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    render(<Text ref={ref}>Text Content</Text>);
    expect(ref.current).not.toBeNull();
  });

  it('combines multiple variant props correctly', () => {
    render(
      <Text variant="accent" size="xl" weight="semibold">
        Text Content
      </Text>
    );
    const text = screen.getByText('Text Content');
    expect(text).toHaveClass('text-brand-500');
    expect(text).toHaveClass('text-xl');
    expect(text).toHaveClass('font-semibold');
  });
});
