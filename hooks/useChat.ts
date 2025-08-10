import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage, ConversationContext } from '@/types/app';
import {
  sendAIChat,
  AIChatRequest,
  listChatSessions,
  loadChatHistory,
  clearChatHistory as apiClearChatHistory,
  createChatSession as apiCreateChatSession,
  deleteChatSession as apiDeleteChatSession,
} from '@/lib/aiApi';

export function useChat() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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

  // Chat sessions state
  const [sessions, setSessions] = useState<string[]>([]);
  const [currentSession, setCurrentSession] = useState<string>('default');
  const [isSessionsVisible, setIsSessionsVisible] = useState<boolean>(false);

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

  // (Deprecated) local clear function was replaced by server-backed clearChatHistory below

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
  const sendMessage = useCallback(async (message: string, project: string = '', modelOverride?: 'kimi2' | 'gpt5' | 'claude') => {
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
        ...recentMessages
          .map(msg => {
            const role: 'user' | 'assistant' | 'system' =
              msg.type === 'user'
                ? 'user'
                : msg.type === 'system'
                  ? 'system'
                  : 'assistant';
            return { role, content: msg.content };
          }),
        { role: 'user' as const, content: userMessage },
      ];

      const chatRequest: AIChatRequest = {
        project: project || conversationContext.currentProject || 'default',
        model: modelOverride || 'kimi2', // Default model, can be overridden
        messages: aiMessages,
        session: currentSession,
      };

      const response = await sendAIChat(chatRequest);

      if (!response.ok) {
        throw new Error(`AI chat failed: ${response.status} ${response.statusText}`);
      }

      const aiResponse = await response.json();

      // Add AI response to chat (store as 'ai' for rendering)
      if (aiResponse && typeof aiResponse.assistant === 'string') {
        addChatMessage(aiResponse.assistant, 'ai');
      } else {
        addChatMessage('Received an unexpected response from AI.', 'system');
      }

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
  }, [chatMessages, conversationContext.currentProject, isGenerating, addChatMessage, currentSession]);

  // Session actions
  const refreshSessions = useCallback(async () => {
    try {
      const list = await listChatSessions();
      setSessions(list);
      if (!list.includes(currentSession)) {
        // Ensure current session exists
        setCurrentSession(list[0] || 'default');
      }
    } catch (e) {
      console.warn('[useChat] Failed to list sessions', e);
    }
  }, [currentSession]);

  const loadSession = useCallback(async (sessionName: string) => {
    try {
      const history = await loadChatHistory(sessionName, 50);
      setCurrentSession(sessionName);
      // Map backend history into ChatMessage list
      const mapped = history.map(h => ({
        content: h.content,
        type: h.role === 'user' ? 'user' : h.role === 'system' ? 'system' : 'ai',
        timestamp: new Date(h.timestamp ? Number(h.timestamp) : Date.now()),
      }));
      setChatMessages(mapped);
    } catch (e) {
      console.warn('[useChat] Failed to load session history', e);
    }
  }, []);

  const createSession = useCallback(async (name: string) => {
    await apiCreateChatSession(name);
    await refreshSessions();
    await loadSession(name);
  }, [refreshSessions, loadSession]);

  const deleteSession = useCallback(async (name: string) => {
    console.debug('[useChat] Deleting session', name);
    await apiDeleteChatSession(name);
    console.debug('[useChat] Deleted session OK', name);
    await refreshSessions();
    if (name === currentSession) {
      const next = sessions.find(s => s !== name) || 'default';
      setCurrentSession(next);
      await loadSession(next);
    }
  }, [currentSession, sessions, refreshSessions, loadSession]);

  const clearChatHistory = useCallback(async () => {
    try {
      await apiClearChatHistory(currentSession);
      setChatMessages([]);
    } catch (e) {
      console.warn('[useChat] Failed to clear history', e);
    }
  }, [currentSession]);

  // Init: fetch sessions on mount
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // After sessions load, default to most recent (first) and load its history
  useEffect(() => {
    if (sessions.length > 0) {
      const mostRecent = sessions[0];
      if (currentSession !== mostRecent || chatMessages.length === 0) {
        setCurrentSession(mostRecent);
        loadSession(mostRecent);
      }
    }
  }, [sessions, currentSession, chatMessages.length, loadSession]);

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
    // removed local clear; server-backed clear provided below
    updateConversationContext,
    sendMessage,
    recentMessages, // Expose memoized recent messages
    // sessions
    sessions,
    currentSession,
    setCurrentSession,
    isSessionsVisible,
    setIsSessionsVisible,
    refreshSessions,
    loadSession,
    createSession,
    deleteSession,
    clearChatHistory, // server-backed
  };
}
