import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage, ConversationContext } from '@/types/app';
import { sendAIChat, AIChatRequest } from '@/lib/aiApi';

export function useChat() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      content:
        'Welcome! I can help you generate code with full context of your project files and structure. Just start chatting and I\'ll assist you with your development tasks!\n\nTip: I can help you create, modify, and manage files in your project workspace.',
      type: 'system',
      timestamp: new Date(),
    },
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiEnabled] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationContext, setConversationContext] =
    useState<ConversationContext>({
      scrapedWebsites: [],
      generatedComponents: [],
      appliedCode: [],
      currentProject: '',
      lastGeneratedCode: undefined,
    });

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Memoized addChatMessage function to prevent unnecessary re-renders
  const addChatMessage = useCallback(
    (
      content: string,
      type: ChatMessage['type'],
      metadata?: ChatMessage['metadata']
    ) => {
      setChatMessages(prev => {
        // Skip duplicate consecutive system messages
        if (type === 'system' && prev.length > 0) {
          const lastMessage = prev[prev.length - 1];
          if (
            lastMessage.type === 'system' &&
            lastMessage.content === content
          ) {
            return prev; // Skip duplicate
          }
        }
        return [...prev, { content, type, timestamp: new Date(), metadata }];
      });
    },
    []
  );

  // Memoized clearChatHistory function
  const clearChatHistory = useCallback(() => {
    setChatMessages([
      {
        content: 'Chat history cleared. How can I help you?',
        type: 'system',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Memoized updateConversationContext function
  const updateConversationContext = useCallback(
    (updates: Partial<ConversationContext>) => {
      setConversationContext(prev => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  // Send AI chat message to backend
  const sendMessage = useCallback(async (message: string, project: string = '') => {
    if (!message.trim() || isGenerating) return;

    const userMessage = message.trim();
    setAiChatInput('');
    setIsGenerating(true);

    // Add user message to chat
    addChatMessage(userMessage, 'user');

    try {
      // Prepare messages for AI (include recent conversation context)
      const recentMessages = chatMessages.slice(-10); // Last 10 messages for context
      const aiMessages = [
        ...recentMessages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant' as const,
          content: msg.content
        })),
        { role: 'user' as const, content: userMessage }
      ];

      const chatRequest: AIChatRequest = {
        project: project || conversationContext.currentProject || 'default',
        model: 'kimi2', // Default model, can be made configurable
        messages: aiMessages
      };

      const response = await sendAIChat(chatRequest);

      if (!response.ok) {
        throw new Error(`AI chat failed: ${response.status} ${response.statusText}`);
      }

      const aiResponse = await response.json();

      // Add AI response to chat
      addChatMessage(aiResponse.assistant, 'assistant');

      // Update conversation context if needed
      if (aiResponse.messages && aiResponse.messages.length > 0) {
        // Extract any relevant context from AI response
        // This could include file changes, package installations, etc.
        console.log('AI response received:', aiResponse);
      }

    } catch (error) {
      console.error('Failed to send AI chat message:', error);
      addChatMessage(
        `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'system'
      );
    } finally {
      setIsGenerating(false);
    }
  }, [chatMessages, conversationContext.currentProject, isGenerating, addChatMessage]);

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
    isGenerating,
    conversationContext,
    setConversationContext,
    chatMessagesRef,
    addChatMessage,
    clearChatHistory,
    updateConversationContext,
    sendMessage,
    recentMessages, // Expose memoized recent messages
  };
}
