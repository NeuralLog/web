import '@testing-library/jest-dom';
import 'structured-clone';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
    }
  }
}

// Window matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Error handling for React warnings during testing
const originalError = console.error;
console.error = (...args) => {
  // Ignores specific React errors during testing
  if (typeof args[0] === 'string' &&
      (args[0].includes('Warning:') ||
       args[0].includes('Error:') ||
       args[0].includes('React does not recognize the `colorScheme` prop'))) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock ResizeObserver which is often not available in JSDOM
class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = ResizeObserverMock;
window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver which is often not available in JSDOM
class IntersectionObserverMock {
  constructor(callback: any) {
    this.callback = callback;
  }
  callback: any;
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.IntersectionObserver = IntersectionObserverMock;
window.IntersectionObserver = IntersectionObserverMock;

// Mock crypto.subtle for API key tests
Object.defineProperty(global.crypto, 'subtle', {
  value: {
    digest: jest.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
  },
});

// Mock NextResponse for middleware tests
// Note: Individual tests may override this mock as needed
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
    })),
    next: jest.fn().mockImplementation(() => ({
      status: 200
    })),
    redirect: jest.fn().mockImplementation(() => ({
      status: 302
    }))
  }
}));
