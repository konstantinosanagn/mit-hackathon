'use client';

import React from 'react';
import styles from './MinimalFilter.module.css';

interface MinimalFilterProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function MinimalFilter({ label, onClick, className = '' }: MinimalFilterProps) {
  return (
    <div className={`${styles['minimal-filter']} ${className}`} onClick={onClick}>
      <div className={styles['filter-label']}>
        {label}
      </div>
      <div className={styles['dropdown-icon']}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="1.5" 
          stroke="currentColor" 
          className="size-4"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="m19.5 8.25-7.5 7.5-7.5-7.5" 
          />
        </svg>
      </div>
    </div>
  );
}
