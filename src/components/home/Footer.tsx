import React from 'react';

interface FooterProps {
  companyName?: string;
}

export const Footer: React.FC<FooterProps> = ({ companyName = 'NeuralLog' }) => {
  return (
    <footer className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
      &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
    </footer>
  );
};
