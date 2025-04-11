import React from 'react';
import { Button, ButtonProps as UIButtonProps } from './ui/Button';

interface TailwindButtonProps extends UIButtonProps {
  label: string;
}

export const TailwindButton: React.FC<TailwindButtonProps> = ({ 
  label, 
  variant = 'default',
  ...rest 
}) => {
  return (
    <Button
      variant={variant}
      label={label}
      {...rest}
    />
  );
};
