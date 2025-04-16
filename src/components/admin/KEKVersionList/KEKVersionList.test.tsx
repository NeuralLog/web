import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KEKVersionList from './index';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('KEKVersionList', () => {
  const mockClient = {
    getKEKVersions: jest.fn(),
    createKEKVersion: jest.fn(),
    rotateKEK: jest.fn(),
    getLogNames: jest.fn(),
    reencryptLogs: jest.fn(),
    initializeWithRecoveryPhrase: jest.fn()
  };

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
    
    mockClient.getLogNames.mockResolvedValue(['log1', 'log2', 'log3']);
  });

  it('renders the component with KEK versions', async () => {
    render(<KEKVersionList />);
    
    // Check that the component renders
    expect(screen.getByText('Key Encryption Key (KEK) Versions')).toBeInTheDocument();
    
    // Wait for the KEK versions to load
    await waitFor(() => {
      expect(mockClient.getKEKVersions).toHaveBeenCalled();
    });
    
    // Check that the KEK versions are displayed
    expect(screen.getByText('kek-v1')).toBeInTheDocument();
    expect(screen.getByText('kek-v2')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('decrypt-only')).toBeInTheDocument();
  });

  it('opens the create KEK dialog when the create button is clicked', async () => {
    render(<KEKVersionList />);
    
    // Click the create button
    fireEvent.click(screen.getByText('Create Version'));
    
    // Check that the dialog is displayed
    expect(screen.getByText('Create KEK Version')).toBeInTheDocument();
  });

  it('creates a new KEK version', async () => {
    mockClient.createKEKVersion.mockResolvedValue({
      id: 'kek-v3',
      createdAt: '2023-03-01T00:00:00Z',
      createdBy: 'admin',
      status: 'active',
      reason: 'Test KEK'
    });
    
    render(<KEKVersionList />);
    
    // Click the create button
    fireEvent.click(screen.getByText('Create Version'));
    
    // Enter a reason
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Test KEK' }
    });
    
    // Click the create button in the dialog
    fireEvent.click(screen.getByText('Create'));
    
    // Check that the createKEKVersion method was called
    await waitFor(() => {
      expect(mockClient.createKEKVersion).toHaveBeenCalledWith('Test KEK');
    });
    
    // Check that the KEK versions are refreshed
    await waitFor(() => {
      expect(mockClient.getKEKVersions).toHaveBeenCalledTimes(2);
    });
  });

  it('opens the rotate KEK dialog when the rotate button is clicked', async () => {
    render(<KEKVersionList />);
    
    // Click the rotate button
    fireEvent.click(screen.getByText('Rotate KEK'));
    
    // Check that the dialog is displayed
    expect(screen.getByText('Rotate KEK')).toBeInTheDocument();
  });

  it('opens the re-encrypt logs dialog when the re-encrypt button is clicked', async () => {
    render(<KEKVersionList />);
    
    // Click the re-encrypt button
    fireEvent.click(screen.getByText('Re-encrypt Logs'));
    
    // Check that the dialog is displayed
    expect(screen.getByText('Re-encrypt Logs')).toBeInTheDocument();
    
    // Wait for the logs to load
    await waitFor(() => {
      expect(mockClient.getLogNames).toHaveBeenCalled();
    });
  });
});
