import { render, screen, fireEvent } from '@/test-utils';
import { ApiKeyList } from '../ApiKeyList';
import { ApiKey } from '@/types/apiKey';

describe('ApiKeyList', () => {
  const mockApiKeys: ApiKey[] = [
    {
      id: 'key-1',
      name: 'Test API Key',
      keyPrefix: 'nlg_1234',
      scopes: ['logs:write', 'logs:read'],
      createdAt: '2025-04-01T12:00:00Z',
      lastUsedAt: '2025-04-05T15:30:00Z',
    },
    {
      id: 'key-2',
      name: 'Development API Key',
      keyPrefix: 'nlg_5678',
      scopes: ['logs:write'],
      createdAt: '2025-04-02T10:00:00Z',
      lastUsedAt: null,
    }
  ];

  const mockOnRevoke = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display API keys when provided', () => {
    // Arrange & Act
    render(
      <ApiKeyList
        apiKeys={mockApiKeys}
        isLoading={false}
        onRevoke={mockOnRevoke}
      />
    );

    // Assert
    expect(screen.getByTestId('api-key-list')).toBeInTheDocument();
    expect(screen.getByText('Test API Key')).toBeInTheDocument();
    expect(screen.getByText('Development API Key')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // Header + 2 rows
  });

  it('should display loading state when isLoading is true', () => {
    // Arrange & Act
    render(
      <ApiKeyList
        apiKeys={[]}
        isLoading={true}
        onRevoke={mockOnRevoke}
      />
    );

    // Assert
    expect(screen.getByTestId('api-key-list-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading API keys...')).toBeInTheDocument();
  });

  it('should display empty state when no API keys are provided', () => {
    // Arrange & Act
    render(
      <ApiKeyList
        apiKeys={[]}
        isLoading={false}
        onRevoke={mockOnRevoke}
      />
    );

    // Assert
    expect(screen.getByTestId('api-key-list-empty')).toBeInTheDocument();
    expect(screen.getByText('No API keys found')).toBeInTheDocument();
  });

  it('should call onRevoke when revoke button is clicked', () => {
    // Arrange
    render(
      <ApiKeyList
        apiKeys={mockApiKeys}
        isLoading={false}
        onRevoke={mockOnRevoke}
      />
    );

    // Act
    const revokeButton = screen.getByTestId('revoke-button-key-1');
    fireEvent.click(revokeButton);

    // Assert
    expect(mockOnRevoke).toHaveBeenCalledWith('key-1');
  });
});
