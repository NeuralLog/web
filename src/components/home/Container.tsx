import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 max-w-4xl w-full">
      {children}
    </div>
  );
};
