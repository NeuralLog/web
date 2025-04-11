import React from 'react';
import { render, screen } from '../../../tests/utils/tailwind-test-utils';
import { Stack, HStack, VStack } from '../Stack';

describe('Stack Components', () => {
  describe('Stack', () => {
    it('renders children correctly', () => {
      render(<Stack>Stack Content</Stack>);
      expect(screen.getByText('Stack Content')).toBeInTheDocument();
    });

    it('applies spacing class correctly', () => {
      render(<Stack spacing={6}>Stack Content</Stack>);
      const stack = screen.getByText('Stack Content');
      expect(stack).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Stack className="test-class">Stack Content</Stack>);
      const stack = screen.getByText('Stack Content');
      expect(stack).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Stack ref={ref}>Stack Content</Stack>);
      expect(ref.current).not.toBeNull();
    });
  });

  describe('HStack', () => {
    it('renders children correctly', () => {
      render(<HStack>HStack Content</HStack>);
      expect(screen.getByText('HStack Content')).toBeInTheDocument();
    });

    it('applies spacing class correctly', () => {
      render(<HStack spacing={6}>HStack Content</HStack>);
      const hstack = screen.getByText('HStack Content');
      expect(hstack).toBeInTheDocument();
    });

    it('has row direction', () => {
      render(<HStack>HStack Content</HStack>);
      const hstack = screen.getByText('HStack Content');
      expect(hstack).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<HStack className="test-class">HStack Content</HStack>);
      const hstack = screen.getByText('HStack Content');
      expect(hstack).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<HStack ref={ref}>HStack Content</HStack>);
      expect(ref.current).not.toBeNull();
    });
  });

  describe('VStack', () => {
    it('renders children correctly', () => {
      render(<VStack>VStack Content</VStack>);
      expect(screen.getByText('VStack Content')).toBeInTheDocument();
    });

    it('applies spacing class correctly', () => {
      render(<VStack spacing={6}>VStack Content</VStack>);
      const vstack = screen.getByText('VStack Content');
      expect(vstack).toBeInTheDocument();
    });

    it('has column direction', () => {
      render(<VStack>VStack Content</VStack>);
      const vstack = screen.getByText('VStack Content');
      expect(vstack).toBeInTheDocument();
    });

    it('has center alignment', () => {
      render(<VStack>VStack Content</VStack>);
      const vstack = screen.getByText('VStack Content');
      expect(vstack).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<VStack className="test-class">VStack Content</VStack>);
      const vstack = screen.getByText('VStack Content');
      expect(vstack).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<VStack ref={ref}>VStack Content</VStack>);
      expect(ref.current).not.toBeNull();
    });
  });
});
