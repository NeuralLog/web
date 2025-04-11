# Testing Chakra UI Components

This document outlines the approaches for testing React components that use Chakra UI in the NeuralLog web application.

## Approaches

There are two main approaches to testing Chakra UI components:

### 1. Mocking Chakra UI Components

This approach involves mocking the Chakra UI components directly, which is simpler and more reliable for basic tests.

```tsx
// Example of mocking Chakra UI components
jest.mock('@chakra-ui/react', () => {
  return {
    Button: ({ children, onClick, colorScheme, ...props }) => {
      const className = `chakra-button ${colorScheme ? `chakra-button--${colorScheme}` : ''}`;
      return (
        <button 
          onClick={onClick} 
          data-testid="chakra-button"
          className={className}
          {...props}
        >
          {children}
        </button>
      );
    },
    // Other components...
  };
});
```

### 2. Using a Custom Render Function with ChakraProvider

This approach involves creating a custom render function that wraps components with the ChakraProvider, which is more complex but allows for testing theme-related functionality.

```tsx
// Example of using a custom render function
import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions } from '@testing-library/react';

// Create a simple theme
const theme = {
  colors: {
    brand: {
      500: '#0ea5e9',
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
};

// Create a wrapper with ChakraProvider
const AllProviders = ({ children }) => {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
};

// Custom render function
const customRender = (
  ui,
  options
) => render(ui, { wrapper: AllProviders, ...options });

// Export
export { customRender as render };
```

## Recommended Approach

For most tests, we recommend using the first approach (mocking Chakra UI components) because:

1. It's simpler and more reliable
2. It doesn't require a real Chakra UI theme or provider
3. It's less likely to break with Chakra UI version changes
4. It's faster and more focused on testing component behavior rather than styling

## Example Test

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraButton } from '../ChakraButton';

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => {
  return {
    Button: ({ children, onClick, colorScheme, ...props }) => {
      const className = `chakra-button ${colorScheme ? `chakra-button--${colorScheme}` : ''}`;
      return (
        <button 
          onClick={onClick} 
          data-testid="chakra-button"
          className={className}
          {...props}
        >
          {children}
        </button>
      );
    },
  };
});

describe('ChakraButton', () => {
  it('renders with the correct label', () => {
    render(<ChakraButton label="Click Me" />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<ChakraButton label="Click Me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct color scheme', () => {
    render(<ChakraButton label="Click Me" colorScheme="blue" />);
    const button = screen.getByText('Click Me');
    
    expect(button).toHaveClass('chakra-button--blue');
  });
});
```

## Resources

- [Chakra UI Testing Documentation](https://chakra-ui.com/docs/components/concepts/testing)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
