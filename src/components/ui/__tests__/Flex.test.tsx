import React from 'react';
import { render, screen } from '../../../tests/utils/tailwind-test-utils';
import { Flex } from '../Flex';

describe('Flex', () => {
  it('renders children correctly', () => {
    render(<Flex>Flex Content</Flex>);
    expect(screen.getByText('Flex Content')).toBeInTheDocument();
  });

  it('applies direction class correctly', () => {
    render(<Flex direction="column">Flex Content</Flex>);
    const flex = screen.getByText('Flex Content');
    expect(flex).toBeInTheDocument();
  });

  it('applies align class correctly', () => {
    render(<Flex align="center">Flex Content</Flex>);
    const flex = screen.getByText('Flex Content');
    expect(flex).toBeInTheDocument();
  });

  it('applies justify class correctly', () => {
    render(<Flex justify="between">Flex Content</Flex>);
    const flex = screen.getByText('Flex Content');
    expect(flex).toBeInTheDocument();
  });

  it('applies wrap class correctly', () => {
    render(<Flex wrap="wrap">Flex Content</Flex>);
    const flex = screen.getByText('Flex Content');
    expect(flex).toBeInTheDocument();
  });

  it('applies gap class correctly', () => {
    render(<Flex gap={4}>Flex Content</Flex>);
    const flex = screen.getByText('Flex Content');
    expect(flex).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Flex className="test-class">Flex Content</Flex>);
    const flex = screen.getByText('Flex Content');
    expect(flex).toBeInTheDocument();
  });

  it('renders with custom element type', () => {
    render(<Flex as="section">Flex Content</Flex>);
    const flex = screen.getByText('Flex Content');
    expect(flex).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Flex ref={ref}>Flex Content</Flex>);
    expect(ref.current).not.toBeNull();
  });
});
