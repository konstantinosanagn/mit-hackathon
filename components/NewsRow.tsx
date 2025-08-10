'use client';

import React from 'react';

interface NewsRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function NewsRow({ children, className = '', onClick }: NewsRowProps) {
  return (
    <div 
      id="news-row"
      className={`p-3 rounded-lg transition-colors duration-200 hover:bg-blue-50 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
