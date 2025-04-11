# Testing Chakra UI Components in Next.js

This guide explains how to effectively test Chakra UI components in our Next.js project.

## Testing Setup

Our project uses the following testing tools:

- Jest: Testing framework
- React Testing Library: For testing React components
- Chakra UI: UI component library

## Key Files

- `jest.config.js`: Main Jest configuration
- `jest.setup.ts`: Setup file for Jest with polyfills and mocks
- `src/test-utils.tsx`: Custom render function that wraps components with ChakraProvider

## Common Testing Patterns

### 1. Basic Component Rendering

```tsx
import { render, screen } from '../../test-utils';
import MyComponent from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### 2. Testing Interactions

```tsx
import { render, screen, fireEvent } from '../../test-utils';
import MyButton from './MyButton';

test('handles click events', () => {
  const handleClick = jest.fn();
  render(<MyButton onClick={handleClick}>Click Me</MyButton>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 3. Testing Chakra UI Specific Features

```tsx
import { render, screen } from '../../test-utils';
import { useColorMode } from '@chakra-ui/react';
import ThemeToggle from './ThemeToggle';

// Create a wrapper component to access Chakra hooks
const TestComponent = () => {
  const { colorMode } = useColorMode();
  return (
    <div>
      <div data-testid="color-mode">{colorMode}</div>
      <ThemeToggle />
    </div>
  );
};

test('toggles theme correctly', () => {
  render(<TestComponent />);
  
  // Initial state
  expect(screen.getByTestId('color-mode').textContent).toBe('light');
  
  // Click the toggle button
  fireEvent.click(screen.getByRole('button'));
  
  // After toggle
  expect(screen.getByTestId('color-mode').textContent).toBe('dark');
});
```

## Best Practices

1. **Use the custom render function**: Always import `render` from our custom `test-utils.tsx` instead of directly from `@testing-library/react`.

2. **Test behavior, not implementation**: Focus on what the component does, not how it's built.

3. **Use semantic queries**: Prefer queries like `getByRole`, `getByLabelText`, and `getByText` over `getByTestId` when possible.

4. **Test in isolation**: Each test should be independent and not rely on the state from other tests.

5. **Mock external dependencies**: Use Jest's mocking capabilities to isolate the component being tested.

## Handling Common Issues

### structuredClone Polyfill

Our `jest.setup.ts` includes a polyfill for `structuredClone` which is used by Chakra UI internally but not available in the Jest environment.

### Window matchMedia Mock

JSDOM doesn't implement `window.matchMedia`, so we've added a mock implementation in `jest.setup.ts`.

### ResizeObserver and IntersectionObserver

These browser APIs are not available in JSDOM, so we've added mock implementations in `jest.setup.ts`.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Example Test Files

- `src/components/example/Button.test.tsx`: Example of testing a basic Chakra UI button
- `src/providers/ChakraProvider.test.tsx`: Example of testing our custom ChakraProvider
