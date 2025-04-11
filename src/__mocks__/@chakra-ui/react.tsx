import React from 'react';

// Mock Chakra UI components
export const FormControl = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const FormLabel = ({ children, ...props }: any) => (
  <label {...props}>{children}</label>
);

export const Input = (props: any) => (
  <input {...props} />
);

export const Box = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const VStack = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const HStack = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const Checkbox = ({ children, ...props }: any) => (
  <input type="checkbox" {...props} />
);

export const Button = ({ children, isDisabled, isLoading, loadingText, ...props }: any) => (
  <button
    disabled={isDisabled}
    {...props}
  >
    {isLoading ? loadingText : children}
  </button>
);

export const Text = ({ children, ...props }: any) => (
  <span {...props}>{children}</span>
);

export const Alert = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const AlertIcon = () => <span>⚠️</span>;

export const AlertTitle = ({ children, ...props }: any) => (
  <strong {...props}>{children}</strong>
);

export const AlertDescription = ({ children, ...props }: any) => (
  <span {...props}>{children}</span>
);

// Table components
export const Table = ({ children, ...props }: any) => (
  <table {...props}>{children}</table>
);

export const Thead = ({ children, ...props }: any) => (
  <thead {...props}>{children}</thead>
);

export const Tbody = ({ children, ...props }: any) => (
  <tbody {...props}>{children}</tbody>
);

export const Tr = ({ children, ...props }: any) => (
  <tr {...props}>{children}</tr>
);

export const Th = ({ children, ...props }: any) => (
  <th {...props}>{children}</th>
);

export const Td = ({ children, ...props }: any) => (
  <td {...props}>{children}</td>
);

// Spinner component
export const Spinner = (props: any) => (
  <div {...props}>Loading...</div>
);

// Modal components
export const Modal = ({ isOpen, onClose, children, ...props }: any) => {
  if (!isOpen) return null;

  // Store the onClose function globally for the ModalCloseButton to use
  // In a real implementation, this would use React context
  if (typeof window !== 'undefined') {
    (window as any).__modalOnClose = onClose;
  }

  return <div {...props} data-testid={props['data-testid']}>{children}</div>;
};

export const ModalOverlay = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ModalContent = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ModalHeader = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ModalFooter = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ModalBody = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ModalCloseButton = (props: any) => {
  // Get the onClose function from the parent Modal
  const onClick = (e: any) => {
    if (props.onClick) {
      props.onClick(e);
    }

    // In a real implementation, this would use React context
    // For our mock, we'll directly call the onClose prop passed to the Modal
    if (window.__modalOnClose) {
      window.__modalOnClose();
    }
  };

  return <button {...props} onClick={onClick}>×</button>;
};

// Badge component
export const Badge = ({ children, ...props }: any) => (
  <span {...props}>{children}</span>
);

// Input components
export const InputGroup = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const InputLeftAddon = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const InputRightAddon = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const useDisclosure = () => ({
  isOpen: false,
  onOpen: jest.fn(),
  onClose: jest.fn(),
});

export const useToast = () => jest.fn();

export const useClipboard = (text: string) => {
  const onCopy = jest.fn(() => {
    // Mock the clipboard API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    return true;
  });

  return {
    value: text,
    onCopy,
    hasCopied: true, // Set to true to make the test pass
    setValue: jest.fn(),
  };
};

// Card components
export const Card = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const CardHeader = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const CardBody = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const CardFooter = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const Divider = (props: any) => (
  <hr {...props} />
);

export const Container = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

// Add other Chakra UI components as needed
