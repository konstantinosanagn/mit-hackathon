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
  isGenerating: boolean;
  generationProgress: GenerationProgress;
  codeApplicationState: CodeApplicationState;
  chatMessagesRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  // sessions
  sessions?: string[];
  currentSession?: string;
  onSelectSession?: (name: string) => void;
  onCreateSession?: (name: string) => void;
  onDeleteSession?: (name: string) => void;
  onClearHistory?: () => void;
  isSessionsVisible?: boolean;
  setIsSessionsVisible?: (visible: boolean) => void;
}

export default function ChatPanel({
  conversationContext,
  chatMessages,
  aiChatInput,
  aiEnabled,
  isGenerating,
  generationProgress,
  codeApplicationState,
  chatMessagesRef,
  onInputChange,
  onSendMessage,
  sessions = [],
  currentSession,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onClearHistory,
  isSessionsVisible = false,
  setIsSessionsVisible,
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

    <div className="flex-1 max-w-[400px] flex flex-col border-r border-border bg-background relative group">
      <ChatResizeHandle onMouseDown={handleResizeMouseDown} />
      {/* Sessions header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-gray-50">
        <div className="text-xs font-medium text-gray-700">Chats</div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setIsSessionsVisible && setIsSessionsVisible(!isSessionsVisible)}
          >
            {isSessionsVisible ? 'Hide' : 'Show'}
          </button>
          <button
            className="text-xs px-2 py-1 rounded bg-orange-600 text-white hover:bg-orange-700"
            onClick={() => {
              const name = prompt('New chat name');
              if (name && onCreateSession) onCreateSession(name);
            }}
          >
            + New
          </button>
        </div>
      </div>

      {isSessionsVisible && (
        <div className="max-h-40 overflow-auto border-b border-border">
          {sessions.length === 0 ? (
            <div className="text-xs text-gray-500 p-2">No chats</div>
          ) : (
            sessions.map(name => (
              <div key={name} className={`flex items-center justify-between px-3 py-1 text-xs ${name === currentSession ? 'bg-gray-100 font-medium' : ''}`}>
                <button className="text-left truncate flex-1" onClick={() => onSelectSession && onSelectSession(name)}>
                  {name}
                </button>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    className="text-[10px] px-1 py-0.5 bg-gray-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectSession) onSelectSession(name);
                      if (onClearHistory) onClearHistory();
                    }}
                  >
                    Clear
                  </button>
                  <button
                    className="text-[10px] px-1 py-0.5 bg-red-600 text-white rounded"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Delete chat \"${name}\"? This cannot be undone.`)) {
                        try {
                          if (onDeleteSession) await onDeleteSession(name);
                        } catch (err: any) {
                          alert(`Failed to delete: ${err?.message || 'Unknown error'}`);
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
        isGenerating={isGenerating}
      />
    </div>
  );
}
