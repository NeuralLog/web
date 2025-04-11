import React from 'react';
import { Button } from '@/components/ui/Button';

interface FeatureCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: 'default' | 'outline' | 'subtle' | 'destructive' | 'ghost' | 'link';
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  buttonText, 
  buttonVariant = 'default' 
}) => {
  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
      <h2 className="text-xl font-semibold mb-3 text-brand-600 dark:text-brand-400">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      <Button variant={buttonVariant} className="w-full">{buttonText}</Button>
    </div>
  );
};
