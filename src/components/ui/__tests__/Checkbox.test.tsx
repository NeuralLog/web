import React from 'react';
import { render, screen, fireEvent } from '../../../tests/utils/tailwind-test-utils';
import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('renders correctly', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Checkbox label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<Checkbox description="Test Description" />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Checkbox error="Error Message" />);
    expect(screen.getByText('Error Message')).toBeInTheDocument();
  });

  it('handles checked state correctly', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    
    // Initially unchecked
    expect(checkbox).not.toBeChecked();
    
    // Check it
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    // Uncheck it
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('calls onChange handler', () => {
    const handleChange = jest.fn();
    render(<Checkbox onChange={handleChange} />);
    
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    
    expect(checkbox).toBeDisabled();
  });

  it('can be controlled', () => {
    const { rerender } = render(<Checkbox checked={true} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
    
    rerender(<Checkbox checked={false} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).not.toBeNull();
  });
});
