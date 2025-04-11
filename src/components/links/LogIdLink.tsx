'use client';

import React from 'react';
import Link from 'next/link';

interface LogIdLinkProps {
  logSlug: string;
  logId: string;
  className?: string;
}

export default function LogIdLink({ logSlug, logId, className = '' }: LogIdLinkProps) {
  return (
    <Link href={`/logs/${logSlug}/${logId}`} className={`block ${className}`}>
      <span className="font-mono break-all text-brand-600 dark:text-brand-400 hover:underline">
        {logId}
      </span>
    </Link>
  );
}
