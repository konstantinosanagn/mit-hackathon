'use client';

import { memo } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/app';

interface ChatMessageProps {
  message: ChatMessageType;
  index: number;
}

const ChatMessage = memo(({ message, index }: ChatMessageProps) => {
  // Check if this message is from a successful generation
  const isGenerationComplete =
    message.content.includes('Successfully recreated') ||
    message.content.includes('AI recreation generated!') ||
    message.content.includes('Code generated!');

  // Get the files from metadata if this is a completion message
  const completedFiles = message.metadata?.appliedFiles || [];

  return (
    <div className="block">
      <div
        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-1`}
      >
        <div className="block">
          <div
            className={`block rounded-[10px] px-4 py-2 ${
              message.type === 'user'
                ? 'bg-[#36322F] text-white ml-auto max-w-[80%]'
                : message.type === 'ai'
                  ? 'bg-gray-100 text-gray-900 mr-auto max-w-[80%]'
                  : message.type === 'system'
                    ? 'bg-[#36322F] text-white text-sm'
                    : message.type === 'command'
                      ? 'bg-[#36322F] text-white font-mono text-sm'
                      : message.type === 'error'
                        ? 'bg-red-900 text-red-100 text-sm border border-red-700'
                        : 'bg-[#36322F] text-white text-sm'
            }`}
          >
            {message.type === 'command' ? (
              <div className="flex items-start gap-2">
                <span
                  className={`text-xs ${
                    message.metadata?.commandType === 'input'
                      ? 'text-blue-400'
                      : message.metadata?.commandType === 'error'
                        ? 'text-red-400'
                        : message.metadata?.commandType === 'success'
                          ? 'text-green-400'
                          : 'text-gray-400'
                  }`}
                >
                  $
                </span>
                <span className="font-mono text-xs">{message.content}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            )}
          </div>

          {/* Show completion status for generation messages */}
          {isGenerationComplete && completedFiles.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              ✓ Applied {completedFiles.length} file
              {completedFiles.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
