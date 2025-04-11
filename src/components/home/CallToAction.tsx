import React from 'react';
import { Button } from '@/components/ui/Button';

interface CTAButton {
  text: string;
  variant: 'default' | 'outline' | 'subtle' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  href?: string;
  onClick?: () => void;
}

interface CallToActionProps {
  buttons: CTAButton[];
}

export const CallToAction: React.FC<CallToActionProps> = ({ buttons }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant}
          size={button.size || 'lg'}
          onClick={button.onClick}
          {...(button.href ? { as: 'a', href: button.href } : {})}
        >
          {button.text}
        </Button>
      ))}
    </div>
  );
};
