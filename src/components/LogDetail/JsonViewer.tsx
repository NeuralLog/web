'use client';

import React from 'react';
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface JsonViewerProps {
  data: any;
  className?: string;
}

export default function JsonViewer({ data, className = '' }: JsonViewerProps) {
  // Detect if we're in dark mode
  const isDarkMode = typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  // Add custom styles to enhance the appearance
  const customStyles = isDarkMode ? {
    ...darkStyles,
    container: `${darkStyles.container} p-0`,
    label: `${darkStyles.label} text-brand-400`,
    valueNum: `${darkStyles.valueNum} text-green-400`,
    valueStr: `${darkStyles.valueStr} text-yellow-300`,
    valueBool: `${darkStyles.valueBool} text-purple-400`,
  } : {
    ...defaultStyles,
    container: `${defaultStyles.container} p-0`,
    label: `${defaultStyles.label} text-brand-600`,
    valueNum: `${defaultStyles.valueNum} text-green-600`,
    valueStr: `${defaultStyles.valueStr} text-yellow-600`,
    valueBool: `${defaultStyles.valueBool} text-purple-600`,
  };

  return (
    <div className={`overflow-auto ${className}`}>
      <JsonView
        data={data}
        style={customStyles}
      />
    </div>
  );
}
