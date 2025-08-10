'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSandbox } from '@/hooks/useSandbox';
import { useChat } from '@/hooks/useChat';
import { useCodeGeneration } from '@/hooks/useCodeGeneration';
import { useHomeScreen } from '@/hooks/useHomeScreen';

interface WorkspaceContextType {
  // Sandbox state
  sandboxData: any;
  loading: boolean;
  status: any;
  structureContent: string;
  
  // Chat state
  chatMessages: any[];
  aiChatInput: string;
  aiEnabled: boolean;
  conversationContext: any;
  
  // Code generation state
  promptInput: string;
  generationProgress: any;
  codeApplicationState: any;
  
  // Home screen state
  homeUrlInput: string;
  homeContextInput: string;
  selectedStyle: string | null;
  urlScreenshot: string | null;
  isCapturingScreenshot: boolean;
  isPreparingDesign: boolean;
  targetUrl: string;
  screenshotError: string | null;
  loadingStage: any;
  
  // Actions
  setAiChatInput: (value: string) => void;
  addChatMessage: (content: string, type: any, metadata?: any) => void;
  setGenerationProgress: (progress: any) => void;
  setPromptInput: (value: string) => void;
  createSandbox: (fromHomeScreen?: boolean) => Promise<any>;
  applyGeneratedCode: (code: string, isEdit: boolean, sandboxData: any, addChatMessage: any, updateConversationContext: any, iframeRef: any, conversationContext: any) => Promise<any>;
  reapplyLastGeneration: (conversationContext: any, sandboxData: any, addChatMessage: any, updateConversationContext: any, applyGeneratedCode: any, iframeRef: any) => Promise<void>;
  downloadZip: () => Promise<any>;
  checkSandboxStatus: () => Promise<void>;
  captureUrlScreenshot: (url: string) => Promise<void>;
  setHomeUrlInput: (value: string) => void;
  setHomeContextInput: (value: string) => void;
  setSelectedStyle: (value: string | null) => void;
  setUrlScreenshot: (value: string | null) => void;
  setIsCapturingScreenshot: (value: boolean) => void;
  setScreenshotError: (value: string | null) => void;
  setIsPreparingDesign: (value: boolean) => void;
  setTargetUrl: (value: string) => void;
  setLoadingStage: (value: any) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  // Custom hooks for state management
  const sandboxData = useSandbox();
  const chatData = useChat();
  const codeGenerationData = useCodeGeneration();
  const homeScreenData = useHomeScreen();

  const contextValue: WorkspaceContextType = {
    // Sandbox state
    sandboxData: sandboxData.sandboxData,
    loading: sandboxData.loading,
    status: sandboxData.status,
    structureContent: sandboxData.structureContent,
    
    // Chat state
    chatMessages: chatData.chatMessages,
    aiChatInput: chatData.aiChatInput,
    aiEnabled: chatData.aiEnabled,
    conversationContext: chatData.conversationContext,
    
    // Code generation state
    promptInput: codeGenerationData.promptInput,
    generationProgress: codeGenerationData.generationProgress,
    codeApplicationState: codeGenerationData.codeApplicationState,
    
    // Home screen state
    homeUrlInput: homeScreenData.homeUrlInput,
    homeContextInput: homeScreenData.homeContextInput,
    selectedStyle: homeScreenData.selectedStyle,
    urlScreenshot: homeScreenData.urlScreenshot,
    isCapturingScreenshot: homeScreenData.isCapturingScreenshot,
    isPreparingDesign: homeScreenData.isPreparingDesign,
    targetUrl: homeScreenData.targetUrl,
    screenshotError: homeScreenData.screenshotError,
    loadingStage: homeScreenData.loadingStage,
    
    // Actions
    setAiChatInput: chatData.setAiChatInput,
    addChatMessage: chatData.addChatMessage,
    setGenerationProgress: codeGenerationData.setGenerationProgress,
    setPromptInput: codeGenerationData.setPromptInput,
    createSandbox: sandboxData.createSandbox,
    applyGeneratedCode: codeGenerationData.applyGeneratedCode,
    reapplyLastGeneration: codeGenerationData.reapplyLastGeneration,
    downloadZip: sandboxData.downloadZip,
    checkSandboxStatus: sandboxData.checkSandboxStatus,
    captureUrlScreenshot: homeScreenData.captureUrlScreenshot,
    setHomeUrlInput: homeScreenData.setHomeUrlInput,
    setHomeContextInput: homeScreenData.setHomeContextInput,
    setSelectedStyle: homeScreenData.setSelectedStyle,
    setUrlScreenshot: homeScreenData.setUrlScreenshot,
    setIsCapturingScreenshot: homeScreenData.setIsCapturingScreenshot,
    setScreenshotError: homeScreenData.setScreenshotError,
    setIsPreparingDesign: homeScreenData.setIsPreparingDesign,
    setTargetUrl: homeScreenData.setTargetUrl,
    setLoadingStage: homeScreenData.setLoadingStage,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}
