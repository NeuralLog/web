import React from 'react';
import { cn } from '@/utils/cn';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, as: Component = 'div', ...props }, ref) => {
    // Create the element with the specified component type
    const ElementType = Component as any;

    return (
      <ElementType
        ref={ref}
        className={cn('', className)}
        {...props}
      />
    );
  }
);

Box.displayName = 'Box';

export { Box };
