import React from 'react';
import { cn } from '@/utils/cn';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: keyof typeof spacingMap;
  as?: React.ElementType;
}

const spacingMap = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
};

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = 4, as: Component = 'div', ...props }, ref) => {
    const ElementType = Component as any;

    return (
      <ElementType
        ref={ref}
        className={cn('flex flex-col', spacingMap[spacing], className)}
        {...props}
      />
    );
  }
);

Stack.displayName = 'Stack';

export interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: keyof typeof spacingMap;
  as?: React.ElementType;
}

const HStack = React.forwardRef<HTMLDivElement, HStackProps>(
  ({ className, spacing = 4, as: Component = 'div', ...props }, ref) => {
    const ElementType = Component as any;

    return (
      <ElementType
        ref={ref}
        className={cn('flex flex-row', spacingMap[spacing], className)}
        {...props}
      />
    );
  }
);

HStack.displayName = 'HStack';

export interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: keyof typeof spacingMap;
  as?: React.ElementType;
}

const VStack = React.forwardRef<HTMLDivElement, VStackProps>(
  ({ className, spacing = 4, as: Component = 'div', ...props }, ref) => {
    const ElementType = Component as any;

    return (
      <ElementType
        ref={ref}
        className={cn('flex flex-col items-center', spacingMap[spacing], className)}
        {...props}
      />
    );
  }
);

VStack.displayName = 'VStack';

export { Stack, HStack, VStack };
