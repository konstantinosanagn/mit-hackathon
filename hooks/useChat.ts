import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage, ConversationContext } from '@/types/app';

export function useChat() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      content: 'Welcome! I can help you generate code with full context of your sandbox files and structure. Just start chatting - I\'ll automatically create a sandbox for you if needed!\n\nTip: If you see package errors like "react-router-dom not found", just type "npm install" or "check packages" to automatically install missing packages.',
      type: 'system',
      timestamp: new Date()
    }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiEnabled] = useState(true);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    scrapedWebsites: [],
    generatedComponents: [],
    appliedCode: [],
    currentProject: '',
    lastGeneratedCode: undefined
  });
  
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Memoized addChatMessage function to prevent unnecessary re-renders
  const addChatMessage = useCallback((content: string, type: ChatMessage['type'], metadata?: ChatMessage['metadata']) => {
    setChatMessages(prev => {
      // Skip duplicate consecutive system messages
      if (type === 'system' && prev.length > 0) {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.type === 'system' && lastMessage.content === content) {
          return prev; // Skip duplicate
        }
      }
      return [...prev, { content, type, timestamp: new Date(), metadata }];
    });
  }, []);

  // Memoized clearChatHistory function
  const clearChatHistory = useCallback(() => {
    setChatMessages([{
      content: 'Chat history cleared. How can I help you?',
      type: 'system',
      timestamp: new Date()
    }]);
  }, []);

  // Memoized updateConversationContext function
  const updateConversationContext = useCallback((updates: Partial<ConversationContext>) => {
    setConversationContext(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Memoized recent messages for context (performance optimization)
  const recentMessages = useMemo(() => {
    return chatMessages.slice(-20); // Only last 20 messages for context
  }, [chatMessages]);

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return {
    chatMessages,
    setChatMessages,
    aiChatInput,
    setAiChatInput,
    aiEnabled,
    conversationContext,
    setConversationContext,
    chatMessagesRef,
    addChatMessage,
    clearChatHistory,
    updateConversationContext,
    recentMessages, // Expose memoized recent messages
  };
}

