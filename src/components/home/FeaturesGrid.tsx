import React from 'react';
import { FeatureCard } from './FeatureCard';

interface Feature {
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: 'default' | 'outline' | 'subtle' | 'destructive' | 'ghost' | 'link';
}

interface FeaturesGridProps {
  features: Feature[];
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ features }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          title={feature.title}
          description={feature.description}
          buttonText={feature.buttonText}
          buttonVariant={feature.buttonVariant}
        />
      ))}
    </div>
  );
};
