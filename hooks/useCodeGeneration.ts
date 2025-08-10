import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  GenerationProgress,
  CodeApplicationState,
  ConversationContext,
} from '@/types/app';
import { appConfig } from '@/config/app.config';
import { SandboxData, CodeApplicationState } from '@/types/app';
import { applyCode } from '@/lib/aiApi';

export function useCodeGeneration() {
  const [promptInput, setPromptInput] = useState('');
  const [generationProgress, setGenerationProgress] =
    useState<GenerationProgress>({
      isGenerating: false,
      status: '',
      components: [],
      currentComponent: 0,
      streamedCode: '',
      isStreaming: false,
      isThinking: false,
      files: [],
      lastProcessedPosition: 0,
    });

  const [codeApplicationState, setCodeApplicationState] =
    useState<CodeApplicationState>({
      stage: null,
    });

  const codeDisplayRef = useRef<HTMLDivElement>(null);

  // Memoized applyGeneratedCode function
  const applyGeneratedCode = useCallback(
    async (
      code: string,
      isEdit: boolean = false,
      sandboxData: any,
      addChatMessage: (content: string, type: any, metadata?: any) => void,
      updateConversationContext: (
        updates: Partial<ConversationContext>
      ) => void,
      iframeRef: React.RefObject<HTMLIFrameElement | null>,
      conversationContext: ConversationContext
    ) => {
      console.log('[applyGeneratedCode] Starting code application...');

      try {
        // Show progress component instead of individual messages
        setCodeApplicationState({ stage: 'analyzing' });

        // Get pending packages from tool calls
        const pendingPackages = ((window as any).pendingPackages || []).filter(
          (pkg: any) => pkg && typeof pkg === 'string'
        );
        if (pendingPackages.length > 0) {
          console.log(
            '[applyGeneratedCode] Sending packages from tool calls:',
            pendingPackages
          );
          // Clear pending packages after use
          (window as any).pendingPackages = [];
        }

        // Use streaming endpoint for real-time feedback
        const response = await applyCode({
          response: code,
          isEdit: isEdit,
          packages: pendingPackages,
          sandboxId: sandboxData?.sandboxId,
        });

        if (!response.ok) {
          throw new Error(`Failed to apply code: ${response.statusText}`);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let finalData: any = null;

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case 'start':
                    setCodeApplicationState({ stage: 'analyzing' });
                    break;

                  case 'step':
                    if (data.message.includes('Installing') && data.packages) {
                      setCodeApplicationState({
                        stage: 'installing',
                        packages: data.packages,
                      });
                    } else if (
                      data.message.includes('Creating files') ||
                      data.message.includes('Applying')
                    ) {
                      setCodeApplicationState({
                        stage: 'applying',
                        filesGenerated: data.filesCreated,
                      });
                    }
                    break;

                  case 'package-progress':
                    if (data.installedPackages) {
                      setCodeApplicationState(prev => ({
                        ...prev,
                        installedPackages: data.installedPackages,
                      }));
                    }
                    break;

                  case 'complete':
                    finalData = data;
                    setCodeApplicationState({ stage: null });
                    break;

                  case 'error':
                    throw new Error(data.error);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }

        if (finalData) {
          // Refresh iframe after successful application
          if (iframeRef?.current && sandboxData?.url) {
            setTimeout(() => {
              if (iframeRef.current) {
                const newSrc = `${sandboxData.url}?t=${Date.now()}`;
                iframeRef.current.src = newSrc;
              }
            }, appConfig.codeApplication.defaultRefreshDelay);
          }

          return finalData;
        }
      } catch (error: any) {
        console.error('[applyGeneratedCode] Error:', error);
        setCodeApplicationState({ stage: null });
        addChatMessage(`Failed to apply code: ${error.message}`, 'error');
        throw error;
      }
    },
    []
  );

  // Memoized reapplyLastGeneration function
  const reapplyLastGeneration = useCallback(
    async (
      conversationContext: ConversationContext,
      sandboxData: any,
      addChatMessage: (content: string, type: any, metadata?: any) => void,
      updateConversationContext: (
        updates: Partial<ConversationContext>
      ) => void,
      applyGeneratedCode: (
        code: string,
        isEdit: boolean,
        sandboxData: any,
        addChatMessage: (content: string, type: any, metadata?: any) => void,
        updateConversationContext: (
          updates: Partial<ConversationContext>
        ) => void,
        iframeRef: React.RefObject<HTMLIFrameElement | null>,
        conversationContext: ConversationContext
      ) => Promise<any>,
      iframeRef: React.RefObject<HTMLIFrameElement | null>
    ) => {
      if (!conversationContext.lastGeneratedCode) {
        addChatMessage('No previous generation to re-apply', 'system');
        return;
      }

      if (!sandboxData) {
        addChatMessage('Please create a sandbox first', 'system');
        return;
      }

      addChatMessage('Re-applying last generation...', 'system');
      const isEdit = conversationContext.appliedCode.length > 0;
      await applyGeneratedCode(
        conversationContext.lastGeneratedCode,
        isEdit,
        sandboxData,
        addChatMessage,
        updateConversationContext,
        iframeRef,
        conversationContext
      );
    },
    []
  );

  // Memoized generation progress for performance
  const memoizedGenerationProgress = useMemo(
    () => generationProgress,
    [
      generationProgress.isGenerating,
      generationProgress.status,
      generationProgress.files.length,
      generationProgress.currentComponent,
      generationProgress.isStreaming,
      generationProgress.isThinking,
    ]
  );

  // Memoized code application state
  const memoizedCodeApplicationState = useMemo(
    () => codeApplicationState,
    [
      codeApplicationState.stage,
      codeApplicationState.packages?.length,
      codeApplicationState.installedPackages?.length,
      codeApplicationState.filesGenerated?.length,
    ]
  );

  return {
    promptInput,
    setPromptInput,
    generationProgress: memoizedGenerationProgress,
    setGenerationProgress,
    codeApplicationState: memoizedCodeApplicationState,
    setCodeApplicationState,
    codeDisplayRef,
    applyGeneratedCode,
    reapplyLastGeneration,
  };
}
