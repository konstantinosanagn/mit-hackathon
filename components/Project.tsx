'use client';

import React from 'react';

interface ProjectProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Project({ children, className = '', onClick }: ProjectProps) {
  return (
    <div 
      id="project"
      className={`p-4 rounded-lg border border-gray-200 transition-colors duration-200 hover:bg-blue-50 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
