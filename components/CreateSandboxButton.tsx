'use client';

import React, { useState } from 'react';
import styles from './CreateSandboxButton.module.css';

interface CreateSandboxButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  isCreating?: boolean;
  title?: string;
  className?: string;
}

export default function CreateSandboxButton({
  onClick,
  disabled = false,
  isCreating = false,
  title = 'Create new sandbox',
  className = '',
}: CreateSandboxButtonProps) {
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isCreating || isLocalLoading) {
      return;
    }

    try {
      setIsLocalLoading(true);
      await onClick();
    } catch (error) {
      console.error('Failed to create sandbox:', error);
      // You could add a toast notification here
    } finally {
      setIsLocalLoading(false);
    }
  };

  const isLoading = isCreating || isLocalLoading;
  const isButtonDisabled = disabled || isLoading;

  return (
    <button
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`${styles.createSandboxButton} ${isLoading ? styles.creating : ''} ${className}`}
      title={isLoading ? 'Creating sandbox...' : title}
    >
      <svg
        className={styles.plusIcon}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      {isLoading && <div className={styles.loadingSpinner}></div>}
    </button>
  );
}
