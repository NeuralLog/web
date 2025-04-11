import React from 'react';
import { render, screen, fireEvent } from '../../../tests/utils/tailwind-test-utils';
import { Select } from '../Select';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Select', () => {
  it('renders correctly', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select options={options} />);
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement.children.length).toBe(3);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select options={options} label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Select options={options} error="Error Message" />);
    expect(screen.getByText('Error Message')).toBeInTheDocument();
  });

  it('handles value change correctly', () => {
    const handleChange = jest.fn();
    render(<Select options={options} onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'option2' } });
    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('can be disabled', () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('can have a disabled option', () => {
    render(<Select options={options} />);
    
    const selectElement = screen.getByRole('combobox');
    const disabledOption = selectElement.children[2] as HTMLOptionElement;
    
    expect(disabledOption.disabled).toBe(true);
  });

  it('applies custom className', () => {
    render(<Select options={options} className="test-class" />);
    expect(screen.getByRole('combobox')).toHaveClass('test-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(<Select options={options} ref={ref} />);
    expect(ref.current).not.toBeNull();
  });
});
