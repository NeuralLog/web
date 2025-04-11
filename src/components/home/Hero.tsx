import React from 'react';

interface HeroProps {
  title: string;
  description: string;
}

export const Hero: React.FC<HeroProps> = ({ title, description }) => {
  return (
    <div className="bg-brand-50 dark:bg-gray-700 p-4 rounded-lg mb-8 border-l-4 border-brand-500">
      <h1 className="text-4xl font-bold mb-6 text-center text-brand-600 dark:text-brand-400">{title}</h1>
      <p className="text-center text-gray-700 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};
