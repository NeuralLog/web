'use client';

import React from 'react';
import Link from 'next/link';

interface LogNameLinkProps {
  logName: string;
  className?: string;
  children?: React.ReactNode;
}

export default function LogNameLink({ logName, className = '', children }: LogNameLinkProps) {
  const displayName = logName || 'unknown';
  
  return (
    <Link href={`/logs/${displayName}`} className={`block ${className}`}>
      <span className="text-brand-600 dark:text-brand-400 hover:underline">
        {children || displayName}
      </span>
    </Link>
  );
}
