import React from 'react';
import { render, screen, fireEvent } from '../../../tests/utils/tailwind-test-utils';
import { Input } from '../Input';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input error="Error Message" />);
    expect(screen.getByText('Error Message')).toBeInTheDocument();
  });

  it('handles value change correctly', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input className="test-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('test-class');
  });

  it('applies error styling when error is provided', () => {
    render(<Input error="Error Message" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('passes through HTML attributes', () => {
    render(<Input placeholder="Enter text" maxLength={10} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toHaveAttribute('maxLength', '10');
  });
});
