'use client';

import { ChatMessage as ChatMessageType, ConversationContext } from '@/types/app';
import { appConfig } from '@/config/app.config';
import ChatMessage from './ChatMessage';

interface ChatMessagesListProps {
  chatMessages: ChatMessageType[];
  chatMessagesRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessagesList({ chatMessages, chatMessagesRef }: ChatMessagesListProps) {
  // Limit the number of rendered messages for better performance
  const maxRenderedMessages = appConfig.performance.maxRenderedMessages;
  const renderedMessages = chatMessages.slice(-maxRenderedMessages);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 scrollbar-hide"
      ref={chatMessagesRef}
    >
      {/* Show message count if some messages are hidden */}
      {chatMessages.length > maxRenderedMessages && (
        <div className="text-xs text-gray-500 text-center py-2">
          Showing last {maxRenderedMessages} of {chatMessages.length} messages
        </div>
      )}

      {renderedMessages.map((msg, idx) => (
        <ChatMessage
          key={`${msg.timestamp.getTime()}-${idx}`}
          message={msg}
          index={idx}
        />
      ))}
    </div>
  );
}
