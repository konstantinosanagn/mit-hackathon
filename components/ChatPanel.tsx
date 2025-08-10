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
import { useState, useRef, useCallback, useEffect } from 'react';

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
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(400);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(400);

  const handleMouseMove = useCallback((moveEvent: MouseEvent) => {
    if (!isResizingRef.current) return;
    
    moveEvent.preventDefault();
    moveEvent.stopPropagation();

    const deltaX = moveEvent.clientX - startXRef.current;
    const newWidth = Math.max(300, Math.min(800, startWidthRef.current + deltaX));
    setPanelWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback((upEvent: MouseEvent) => {
    if (!isResizingRef.current) return;
    
    upEvent.preventDefault();
    upEvent.stopPropagation();

    isResizingRef.current = false;
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
    isResizingRef.current = true;
    setIsResizing(true);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelWidth, handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isResizingRef.current) {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={resizeRef}
      className="flex flex-col border-r border-border bg-background relative group"
      style={{ 
        width: `${panelWidth}px`,
        maxWidth: `${panelWidth}px`,
        minWidth: `${panelWidth}px`,
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      <ChatResizeHandle onMouseDown={handleResizeMouseDown} isResizing={isResizing} />
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
