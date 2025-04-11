import { render, screen } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('should display the error message', () => {
    // Arrange
    const errorMessage = 'This is an error message';
    
    // Act
    render(<ErrorMessage message={errorMessage} />);
    
    // Assert
    expect(screen.getByTestId('error-message')).toHaveTextContent('This is an error message');
  });
});
