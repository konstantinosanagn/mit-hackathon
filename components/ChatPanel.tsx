'use client';

import {
  ChatMessage as ChatMessageType,
  ConversationContext,
  GenerationProgress,
  CodeApplicationState,
} from '@/types/app';
import ChatResizeHandle from './chat/ChatResizeHandle';
import ScrapedWebsitesList from './chat/ScrapedWebsitesList';
import ChatMessagesList from './chat/ChatMessagesList';
import CodeApplicationProgress from '@/components/CodeApplicationProgress';
import ChatInput from '@/components/ChatInput';

interface ChatPanelProps {
  conversationContext: ConversationContext;
  chatMessages: ChatMessageType[];
  aiChatInput: string;
  aiEnabled: boolean;
  generationProgress: GenerationProgress;
  codeApplicationState: CodeApplicationState;
  chatMessagesRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export default function ChatPanel({
  conversationContext,
  chatMessages,
  aiChatInput,
  aiEnabled,
  generationProgress,
  codeApplicationState,
  chatMessagesRef,
  onInputChange,
  onSendMessage,
}: ChatPanelProps) {
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const parentElement = e.currentTarget.parentElement;
    if (!parentElement) return;

    const startWidth = parentElement.offsetWidth;
    let isResizing = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing) return;
      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(300, Math.min(800, startWidth + deltaX));

      if (parentElement && parentElement.isConnected) {
        parentElement.style.maxWidth = `${newWidth}px`;
        parentElement.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      isResizing = false;
      upEvent.preventDefault();
      upEvent.stopPropagation();

      document.removeEventListener('mousemove', handleMouseMove, {
        capture: true,
      });
      document.removeEventListener('mouseup', handleMouseUp, {
        capture: true,
      });
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove, {
      capture: true,
    });
    document.addEventListener('mouseup', handleMouseUp, {
      capture: true,
    });
  };

  return (
    <div className="flex-1 max-w-[400px] flex flex-col border-r border-border bg-background relative group">
      <ChatResizeHandle onMouseDown={handleResizeMouseDown} />
      <ScrapedWebsitesList conversationContext={conversationContext} />
      <ChatMessagesList chatMessages={chatMessages} chatMessagesRef={chatMessagesRef} />
      {(codeApplicationState.stage === 'analyzing' ||
        codeApplicationState.stage === 'installing' ||
        codeApplicationState.stage === 'applying') && (
        <div className="border-t border-border">
          <CodeApplicationProgress state={codeApplicationState} />
        </div>
      )}
      <ChatInput
        value={aiChatInput}
        onChange={onInputChange}
        onSend={onSendMessage}
        disabled={!aiEnabled}
        isGenerating={generationProgress.isGenerating}
      />
    </div>
  );
}
