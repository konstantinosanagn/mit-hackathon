'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  isGenerating?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  placeholder = 'Ask me to create or modify your app...',
  disabled = false,
  isGenerating = false,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const isSendDisabled = disabled || !value.trim() || isGenerating;
  
  // Debug logging to help identify the issue
  console.debug('[ChatInput] Button state:', {
    disabled,
    hasValue: !!value.trim(),
    isGenerating,
    isSendDisabled
  });

  const handleSendClick = () => {
    console.debug('[ChatInput] Send button clicked, isSendDisabled:', isSendDisabled);
    if (!isSendDisabled) {
      console.debug('[ChatInput] Calling onSend function');
      onSend();
    } else {
      console.debug('[ChatInput] Send button is disabled, ignoring click');
    }
  };

  return (
    <div className={styles.chatInputContainer}>
      <div className={styles.chatInputWrapper}>
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={styles.chatInputField}
          onKeyDown={handleKeyDown}
          disabled={disabled || isGenerating}
        />
        <button
          onClick={handleSendClick}
          disabled={isSendDisabled}
          className={styles.chatSendButton}
          type="button"
          aria-label="Send message"
          tabIndex={isSendDisabled ? -1 : 0}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={styles.sendIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m7.49 12-3.75 3.75m0 0 3.75 3.75m-3.75-3.75h16.5V4.499"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
