'use client';

import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CodeApplicationProgress from '@/components/CodeApplicationProgress';
import ChatInput from '@/components/ChatInput';
import { ChatMessage, ConversationContext, GenerationProgress, CodeApplicationState } from '@/types/app';
import { appConfig } from '@/config/app.config';
import { memo } from 'react';

interface ChatPanelProps {
  conversationContext: ConversationContext;
  chatMessages: ChatMessage[];
  aiChatInput: string;
  aiEnabled: boolean;
  generationProgress: GenerationProgress;
  codeApplicationState: CodeApplicationState;
  chatMessagesRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

// Memoized chat message component for better performance
const ChatMessageComponent = memo(({ message, index }: { message: ChatMessage; index: number }) => {
  // Check if this message is from a successful generation
  const isGenerationComplete = message.content.includes('Successfully recreated') || 
                             message.content.includes('AI recreation generated!') ||
                             message.content.includes('Code generated!');
  
  // Get the files from metadata if this is a completion message
  const completedFiles = message.metadata?.appliedFiles || [];
  
  return (
    <div className="block">
      <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className="block">
          <div className={`block rounded-[10px] px-4 py-2 ${
            message.type === 'user' ? 'bg-[#36322F] text-white ml-auto max-w-[80%]' :
            message.type === 'ai' ? 'bg-gray-100 text-gray-900 mr-auto max-w-[80%]' :
            message.type === 'system' ? 'bg-[#36322F] text-white text-sm' :
            message.type === 'command' ? 'bg-[#36322F] text-white font-mono text-sm' :
            message.type === 'error' ? 'bg-red-900 text-red-100 text-sm border border-red-700' :
            'bg-[#36322F] text-white text-sm'
          }`}>
            {message.type === 'command' ? (
              <div className="flex items-start gap-2">
                <span className={`text-xs ${
                  message.metadata?.commandType === 'input' ? 'text-blue-400' :
                  message.metadata?.commandType === 'error' ? 'text-red-400' :
                  message.metadata?.commandType === 'success' ? 'text-green-400' :
                  'text-gray-400'
                }`}>
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
              ✓ Applied {completedFiles.length} file{completedFiles.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessageComponent.displayName = 'ChatMessageComponent';

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
  // Limit the number of rendered messages for better performance
  const maxRenderedMessages = appConfig.performance.maxRenderedMessages;
  const renderedMessages = chatMessages.slice(-maxRenderedMessages);
  
  return (
    <div className="flex-1 max-w-[400px] flex flex-col border-r border-border bg-background relative group">
      {/* Resize handle */}
      <div 
        className="absolute -right-1 top-0 bottom-0 w-2 bg-gray-300 opacity-0 group-hover:opacity-100 hover:opacity-100 cursor-col-resize transition-opacity z-10 select-none user-select-none"
        onMouseDown={(e) => {
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
            
            document.removeEventListener('mousemove', handleMouseMove, { capture: true });
            document.removeEventListener('mouseup', handleMouseUp, { capture: true });
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
          };
          
          // Set cursor and user-select on body during resize
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          
          document.addEventListener('mousemove', handleMouseMove, { capture: true });
          document.addEventListener('mouseup', handleMouseUp, { capture: true });
        }}
      />
      {conversationContext.scrapedWebsites.length > 0 && (
        <div className="p-4 bg-card">
          <div className="flex flex-col gap-2">
            {conversationContext.scrapedWebsites.map((site, idx) => {
              // Extract favicon and site info from the scraped data
              const metadata = site.content?.metadata || {};
              const sourceURL = metadata.sourceURL || site.url;
              const favicon = metadata.favicon || `https://www.google.com/s2/favicons?domain=${new URL(sourceURL).hostname}&sz=32`;
              const siteName = metadata.ogSiteName || metadata.title || new URL(sourceURL).hostname;
              
              return (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <img 
                    src={favicon} 
                    alt={siteName}
                    className="w-4 h-4 rounded"
                    onError={(e) => {
                      e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${new URL(sourceURL).hostname}&sz=32`;
                    }}
                  />
                  <a 
                    href={sourceURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-black hover:text-gray-700 truncate max-w-[250px]"
                    title={sourceURL}
                  >
                    {siteName}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 scrollbar-hide" ref={chatMessagesRef}>
        {/* Show message count if some messages are hidden */}
        {chatMessages.length > maxRenderedMessages && (
          <div className="text-xs text-gray-500 text-center py-2">
            Showing last {maxRenderedMessages} of {chatMessages.length} messages
          </div>
        )}
        
        {renderedMessages.map((msg, idx) => (
          <ChatMessageComponent key={`${msg.timestamp.getTime()}-${idx}`} message={msg} index={idx} />
        ))}
      </div>
      
             {/* Code Application Progress */}
       {(codeApplicationState.stage === 'analyzing' || 
         codeApplicationState.stage === 'installing' || 
         codeApplicationState.stage === 'applying') && (
         <div className="border-t border-border">
           <CodeApplicationProgress state={codeApplicationState} />
         </div>
       )}

      {/* Input Area */}
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

