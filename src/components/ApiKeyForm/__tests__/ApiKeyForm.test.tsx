import { render, screen, fireEvent } from '@/test-utils';
import ApiKeyForm from '../ApiKeyForm';

describe('ApiKeyForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form with name field and scope checkboxes', () => {
    // Arrange & Act
    render(
      <ApiKeyForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        error={null}
      />
    );

    // Assert
    expect(screen.getByTestId('api-key-form')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByTestId('scope-checkbox-logs-write')).toBeInTheDocument();
    expect(screen.getByTestId('scope-checkbox-logs-read')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should display error message when error is provided', () => {
    // Arrange & Act
    const errorMessage = 'Test error message';
    render(
      <ApiKeyForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        error={errorMessage}
      />
    );

    // Assert
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
  });

  it('should call onSubmit with name and scopes when form is submitted', () => {
    // Arrange
    render(
      <ApiKeyForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        error={null}
      />
    );

    // Act
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Test API Key' } });

    const form = screen.getByTestId('api-key-form');
    fireEvent.submit(form);

    // Assert
    expect(mockOnSubmit).toHaveBeenCalledWith('Test API Key', ['logs:write', 'logs:read']);
  });

  it('should disable submit button when isSubmitting is true', () => {
    // Arrange & Act
    render(
      <ApiKeyForm
        onSubmit={mockOnSubmit}
        isSubmitting={true}
        error={null}
      />
    );

    // Assert
    expect(screen.getByTestId('submit-button')).toBeDisabled();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Creating...');
  });
});
