import { render, screen, fireEvent } from '@/test-utils';
import FormField from '../FormField';

describe('FormField', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label and input', () => {
    // Arrange & Act
    render(
      <FormField
        id="test-field"
        label="Test Label"
        value=""
        onChange={mockOnChange}
      />
    );

    // Assert
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-test-field')).toBeInTheDocument();
  });

  it('should call onChange when input value changes', () => {
    // Arrange
    render(
      <FormField
        id="test-field"
        label="Test Label"
        value=""
        onChange={mockOnChange}
      />
    );

    // Act
    const input = screen.getByTestId('form-field-test-field');
    fireEvent.change(input, { target: { value: 'new value' } });

    // Assert
    expect(mockOnChange).toHaveBeenCalledWith('new value');
  });

  it('should apply placeholder when provided', () => {
    // Arrange & Act
    render(
      <FormField
        id="test-field"
        label="Test Label"
        value=""
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    // Assert
    expect(screen.getByTestId('form-field-test-field')).toHaveAttribute('placeholder', 'Test placeholder');
  });

  it('should mark as required when required prop is true', () => {
    // Arrange & Act
    render(
      <FormField
        id="test-field"
        label="Test Label"
        value=""
        onChange={mockOnChange}
        required={true}
      />
    );

    // Assert
    expect(screen.getByTestId('form-field-test-field')).toBeRequired();
  });
});
