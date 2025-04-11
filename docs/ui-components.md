# NeuralLog UI Components

This document provides an overview of the UI components available in the NeuralLog web application. These components are built using Tailwind CSS and Headless UI.

## Button

The Button component is a versatile button that can be used for various actions.

```jsx
import { Button } from '@/components/ui/Button';

// Default button
<Button>Click me</Button>

// Primary button
<Button variant="default">Primary</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Outline button
<Button variant="outline">Outline</Button>

// Success button
<Button variant="success">Success</Button>

// Disabled button
<Button disabled>Disabled</Button>

// Small button
<Button size="sm">Small</Button>

// Large button
<Button size="lg">Large</Button>

// Full width button
<Button fullWidth>Full Width</Button>

// Button with icon
<Button>
  <Icon className="mr-2" />
  With Icon
</Button>

// Button with onClick handler
<Button onClick={() => console.log('Clicked!')}>Click me</Button>
```

## Input

The Input component is a text input field.

```jsx
import { Input } from '@/components/ui/Input';

// Default input
<Input placeholder="Enter text" />

// Disabled input
<Input disabled placeholder="Disabled" />

// Input with value
<Input value="Hello" onChange={(e) => setValue(e.target.value)} />

// Input with error
<Input error="This field is required" />

// Input with label
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <Input type="email" placeholder="Enter your email" />
</div>
```

## Box

The Box component is a simple container that can be used to wrap other components.

```jsx
import { Box } from '@/components/ui/Box';

// Default box
<Box>Content</Box>

// Box with padding
<Box p="4">Content with padding</Box>

// Box with margin
<Box m="4">Content with margin</Box>

// Box with border
<Box border>Content with border</Box>

// Box with rounded corners
<Box rounded>Content with rounded corners</Box>

// Box with shadow
<Box shadow>Content with shadow</Box>

// Box with background color
<Box bg="gray-100">Content with background</Box>
```

## Text

The Text component is used for displaying text.

```jsx
import { Text } from '@/components/ui/Text';

// Default text
<Text>Regular text</Text>

// Text with different sizes
<Text size="xs">Extra small text</Text>
<Text size="sm">Small text</Text>
<Text size="base">Base text</Text>
<Text size="lg">Large text</Text>
<Text size="xl">Extra large text</Text>

// Text with different weights
<Text weight="normal">Normal weight</Text>
<Text weight="medium">Medium weight</Text>
<Text weight="semibold">Semibold weight</Text>
<Text weight="bold">Bold weight</Text>

// Text with different colors
<Text color="gray-500">Gray text</Text>
<Text color="red-500">Red text</Text>
<Text color="blue-500">Blue text</Text>

// Text with truncation
<Text truncate>This text will be truncated if it's too long...</Text>
```

## Card

The Card component is a container with a border, shadow, and rounded corners.

```jsx
import { Card } from '@/components/ui/Card';

// Default card
<Card>
  <h2 className="text-xl font-semibold mb-2">Card Title</h2>
  <p>Card content goes here.</p>
</Card>

// Card with padding
<Card p="6">
  <h2 className="text-xl font-semibold mb-2">Card Title</h2>
  <p>Card content goes here.</p>
</Card>

// Card with hover effect
<Card hover>
  <h2 className="text-xl font-semibold mb-2">Card Title</h2>
  <p>Card content goes here.</p>
</Card>
```

## Flex

The Flex component is a container that uses flexbox for layout.

```jsx
import { Flex } from '@/components/ui/Flex';

// Default flex (row)
<Flex>
  <div>Item 1</div>
  <div>Item 2</div>
</Flex>

// Flex column
<Flex direction="col">
  <div>Item 1</div>
  <div>Item 2</div>
</Flex>

// Flex with justify content
<Flex justify="between">
  <div>Left</div>
  <div>Right</div>
</Flex>

// Flex with align items
<Flex align="center">
  <div>Centered</div>
</Flex>

// Flex with gap
<Flex gap="4">
  <div>Item 1</div>
  <div>Item 2</div>
</Flex>
```

## Stack

The Stack component is a container that arranges its children in a vertical or horizontal stack with consistent spacing.

```jsx
import { Stack, HStack, VStack } from '@/components/ui/Stack';

// Vertical stack (default)
<Stack spacing="4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Horizontal stack
<HStack spacing="4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</HStack>

// Vertical stack (explicit)
<VStack spacing="4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</VStack>

// Stack with alignment
<VStack align="start" spacing="4">
  <div>Left aligned</div>
  <div>Left aligned</div>
</VStack>
```

## Checkbox

The Checkbox component is a custom checkbox input.

```jsx
import { Checkbox } from '@/components/ui/Checkbox';

// Default checkbox
<Checkbox />

// Checkbox with label
<div className="flex items-center">
  <Checkbox id="terms" />
  <label htmlFor="terms" className="ml-2">
    I agree to the terms and conditions
  </label>
</div>

// Checked checkbox
<Checkbox checked />

// Disabled checkbox
<Checkbox disabled />

// Checkbox with onChange handler
<Checkbox 
  checked={isChecked} 
  onCheckedChange={(checked) => setIsChecked(checked)} 
/>
```

## Select

The Select component is a custom select input.

```jsx
import { Select } from '@/components/ui/Select';

// Default select
<Select>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
  <option value="option3">Option 3</option>
</Select>

// Select with placeholder
<Select placeholder="Select an option">
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
  <option value="option3">Option 3</option>
</Select>

// Disabled select
<Select disabled>
  <option value="option1">Option 1</option>
</Select>

// Select with onChange handler
<Select 
  value={selectedValue} 
  onChange={(e) => setSelectedValue(e.target.value)}
>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
  <option value="option3">Option 3</option>
</Select>
```

## Migrating from Chakra UI

If you're migrating from Chakra UI to Tailwind UI, here's a quick reference for component equivalents:

| Chakra UI Component | Tailwind UI Component |
|---------------------|----------------------|
| `<Button>` | `<Button>` |
| `<Input>` | `<Input>` |
| `<Box>` | `<Box>` |
| `<Text>` | `<Text>` |
| `<Flex>` | `<Flex>` |
| `<Stack>` | `<Stack>` |
| `<HStack>` | `<HStack>` |
| `<VStack>` | `<VStack>` |
| `<Checkbox>` | `<Checkbox>` |
| `<Select>` | `<Select>` |
| `<Card>` | `<Card>` |

## Testing UI Components

All UI components have comprehensive test coverage. You can run the tests with:

```bash
npm test -- src/components/ui/__tests__
```

Each component has its own test file in the `src/components/ui/__tests__` directory.
