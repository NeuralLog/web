import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KEKRecoveryFlow from './index';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('KEKRecoveryFlow', () => {
  const mockClient = {
    getKEKVersions: jest.fn(),
    initiateKEKRecovery: jest.fn(),
    getKEKRecoverySession: jest.fn(),
    submitRecoveryShare: jest.fn(),
    completeKEKRecovery: jest.fn()
  };

  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock the useAuth hook implementation
    (useAuth as jest.Mock).mockReturnValue({
      client: mockClient
    });
    
    // Mock the client methods
    mockClient.getKEKVersions.mockResolvedValue([
      {
        id: 'kek-v1',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'admin',
        status: 'active',
        reason: 'Initial KEK'
      },
      {
        id: 'kek-v2',
        createdAt: '2023-02-01T00:00:00Z',
        createdBy: 'admin',
        status: 'decrypt-only',
        reason: 'Rotated KEK'
      }
    ]);
    
    mockClient.initiateKEKRecovery.mockResolvedValue({
      id: 'recovery-session-1',
      versionId: 'kek-v1',
      threshold: 3,
      reason: 'Test recovery',
      status: 'pending',
      shares: [],
      createdAt: '2023-03-01T00:00:00Z',
      expiresAt: '2023-03-02T00:00:00Z'
    });
    
    mockClient.getKEKRecoverySession.mockResolvedValue({
      id: 'recovery-session-1',
      versionId: 'kek-v1',
      threshold: 3,
      reason: 'Test recovery',
      status: 'pending',
      shares: [
        {
          userId: 'user1',
          submittedAt: '2023-03-01T01:00:00Z'
        }
      ],
      createdAt: '2023-03-01T00:00:00Z',
      expiresAt: '2023-03-02T00:00:00Z'
    });
  });

  it('renders the component with stepper', () => {
    render(<KEKRecoveryFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Check that the stepper is displayed
    expect(screen.getByText('Initiate Recovery')).toBeInTheDocument();
    expect(screen.getByText('Collect Shares')).toBeInTheDocument();
    expect(screen.getByText('Complete Recovery')).toBeInTheDocument();
  });

  it('displays the initiate recovery step initially', async () => {
    render(<KEKRecoveryFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Check that the initiate recovery step is displayed
    expect(screen.getByText('Initiate KEK Recovery')).toBeInTheDocument();
    
    // Wait for the KEK versions to load
    await waitFor(() => {
      expect(mockClient.getKEKVersions).toHaveBeenCalled();
    });
  });

  it('moves to the collect shares step after initiating recovery', async () => {
    render(<KEKRecoveryFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Wait for the KEK versions to load
    await waitFor(() => {
      expect(mockClient.getKEKVersions).toHaveBeenCalled();
    });
    
    // Enter a reason
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Test recovery' }
    });
    
    // Click the initiate button
    fireEvent.click(screen.getByText('Initiate Recovery'));
    
    // Check that we moved to the collect shares step
    await waitFor(() => {
      expect(screen.getByText('Collect Recovery Shares')).toBeInTheDocument();
    });
  });

  it('allows adding and removing shares', async () => {
    render(<KEKRecoveryFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Wait for the KEK versions to load
    await waitFor(() => {
      expect(mockClient.getKEKVersions).toHaveBeenCalled();
    });
    
    // Enter a reason
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Test recovery' }
    });
    
    // Click the initiate button
    fireEvent.click(screen.getByText('Initiate Recovery'));
    
    // Wait for the collect shares step
    await waitFor(() => {
      expect(screen.getByText('Collect Recovery Shares')).toBeInTheDocument();
    });
    
    // Enter a share
    fireEvent.change(screen.getByLabelText('Share (JSON format)'), {
      target: { value: '{"x": 1, "y": "encrypted-share-data"}' }
    });
    
    // Add the share
    fireEvent.click(screen.getByTestId('AddIcon'));
    
    // Check that the share was added
    await waitFor(() => {
      expect(screen.getByText('Share 1')).toBeInTheDocument();
    });
  });

  it('moves to the complete recovery step after collecting shares', async () => {
    render(<KEKRecoveryFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Wait for the KEK versions to load
    await waitFor(() => {
      expect(mockClient.getKEKVersions).toHaveBeenCalled();
    });
    
    // Enter a reason
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Test recovery' }
    });
    
    // Click the initiate button
    fireEvent.click(screen.getByText('Initiate Recovery'));
    
    // Wait for the collect shares step
    await waitFor(() => {
      expect(screen.getByText('Collect Recovery Shares')).toBeInTheDocument();
    });
    
    // Add three shares
    for (let i = 0; i < 3; i++) {
      // Enter a share
      fireEvent.change(screen.getByLabelText('Share (JSON format)'), {
        target: { value: `{"x": ${i + 1}, "y": "encrypted-share-data-${i + 1}"}` }
      });
      
      // Add the share
      fireEvent.click(screen.getByTestId('AddIcon'));
    }
    
    // Click the reconstruct button
    fireEvent.click(screen.getByText('Reconstruct KEK'));
    
    // Check that we moved to the complete recovery step
    await waitFor(() => {
      expect(screen.getByText('Complete KEK Recovery')).toBeInTheDocument();
    });
  });

  it('completes the recovery process', async () => {
    mockClient.completeKEKRecovery.mockResolvedValue({
      status: 'success',
      message: 'KEK recovery completed successfully',
      result: {
        sessionId: 'recovery-session-1',
        versionId: 'kek-v1',
        newVersionId: 'kek-v3',
        status: 'completed',
        completedAt: '2023-03-01T02:00:00Z'
      }
    });
    
    render(<KEKRecoveryFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />);
    
    // Wait for the KEK versions to load
    await waitFor(() => {
      expect(mockClient.getKEKVersions).toHaveBeenCalled();
    });
    
    // Enter a reason
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Test recovery' }
    });
    
    // Click the initiate button
    fireEvent.click(screen.getByText('Initiate Recovery'));
    
    // Wait for the collect shares step
    await waitFor(() => {
      expect(screen.getByText('Collect Recovery Shares')).toBeInTheDocument();
    });
    
    // Add three shares
    for (let i = 0; i < 3; i++) {
      // Enter a share
      fireEvent.change(screen.getByLabelText('Share (JSON format)'), {
        target: { value: `{"x": ${i + 1}, "y": "encrypted-share-data-${i + 1}"}` }
      });
      
      // Add the share
      fireEvent.click(screen.getByTestId('AddIcon'));
    }
    
    // Click the reconstruct button
    fireEvent.click(screen.getByText('Reconstruct KEK'));
    
    // Wait for the complete recovery step
    await waitFor(() => {
      expect(screen.getByText('Complete KEK Recovery')).toBeInTheDocument();
    });
    
    // Click the complete button
    fireEvent.click(screen.getByText('Complete Recovery'));
    
    // Check that the onComplete callback was called
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});
