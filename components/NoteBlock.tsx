'use client';

import React from 'react';
import './NoteBlock.module.css';

interface NoteBlockProps {
  children: React.ReactNode;
  className?: string;
}

export default function NoteBlock({ children, className = '' }: NoteBlockProps) {
  return (
    <div className={`note-block ${className}`}>
      {children}
    </div>
  );
}
