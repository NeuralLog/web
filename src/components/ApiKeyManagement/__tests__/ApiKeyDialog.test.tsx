import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { ApiKeyDialog } from '../ApiKeyDialog';

describe('ApiKeyDialog', () => {
  const mockApiKey = 'nlg_abcdef1234567890';
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  it('should display the API key when isOpen is true', () => {
    // Arrange & Act
    render(
      <ApiKeyDialog
        isOpen={true}
        apiKey={mockApiKey}
        onClose={mockOnClose}
      />
    );

    // Assert
    expect(screen.getByTestId('api-key-dialog')).toBeInTheDocument();
    // Check for the input with the API key value instead of text
    expect(screen.getByDisplayValue(mockApiKey)).toBeInTheDocument();
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
  });

  it('should not display the dialog when isOpen is false', () => {
    // Arrange & Act
    render(
      <ApiKeyDialog
        isOpen={false}
        apiKey={mockApiKey}
        onClose={mockOnClose}
      />
    );

    // Assert
    expect(screen.queryByTestId('api-key-dialog')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    // Arrange
    render(
      <ApiKeyDialog
        isOpen={true}
        apiKey={mockApiKey}
        onClose={mockOnClose}
      />
    );

    // Act
    // Find the close button in the modal by test ID
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should copy API key to clipboard when copy button is clicked', async () => {
    // Arrange
    render(
      <ApiKeyDialog
        isOpen={true}
        apiKey={mockApiKey}
        onClose={mockOnClose}
      />
    );

    // Act
    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);

    // Assert
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockApiKey);

    // Wait for state update
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });
});
