'use client';

import React from 'react';
import NewsTitle from './NewsTitle';
import NewsContent from './NewsContent';

interface NewsProps {
  className?: string;
}

export default function News({ className = '' }: NewsProps) {
  return (
    <div 
      id="news"
      className={`w-full bg-transparent h-full flex flex-col ${className}`}
    >
      <NewsTitle className="mb-3" />
      <NewsContent />
    </div>
  );
}
