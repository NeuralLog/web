import React from 'react';
import { cn } from '@/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const textVariants = cva('text-gray-900 dark:text-gray-100', {
  variants: {
    variant: {
      default: 'text-gray-900 dark:text-gray-100',
      muted: 'text-gray-500 dark:text-gray-400',
      accent: 'text-brand-500 dark:text-brand-400',
      error: 'text-red-500 dark:text-red-400',
    },
    size: {
      default: 'text-base',
      xs: 'text-xs',
      sm: 'text-sm',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weight: {
      default: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    weight: 'default',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: React.ElementType;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, size, weight, as: Component = 'p', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(textVariants({ variant, size, weight, className }))}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

export { Text, textVariants };
