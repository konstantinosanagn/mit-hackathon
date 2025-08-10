'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { appConfig } from '@/config/app.config';
import { ActiveTab } from '@/types/app';
import { useWorkspace } from './WorkspaceProvider';
import { backendFetch } from '@/lib/backend';

interface WorkspaceControllerProps {
  children: (props: {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    aiModel: string;
    setAiModel: (model: string) => void;
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    headerProps: any;
    chatPanelProps: any;
    previewPanelProps: any;
    project?: string;
    sandboxStatus: any; // Fix type to match the actual status object
  }) => React.ReactNode;
}

export default function WorkspaceController({ children }: WorkspaceControllerProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('code');
  const [aiModel, setAiModel] = useState(appConfig.ai.defaultModel);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const workspace = useWorkspace();
  const searchParams = useSearchParams();
  const project = searchParams.get('project');

  // Ensure backend sandbox/workspace is initialised when a project is loaded
  const lastInitialisedProjectRef = useRef<string | null>(null);
  useEffect(() => {
    const initSandbox = async (name: string) => {
      try {
        const res = await backendFetch('/api/sandbox/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: name }),
        });
        if (!res.ok) {
          console.warn('[WorkspaceController] Sandbox init failed:', res.status, res.statusText);
        } else {
          console.log('[WorkspaceController] Sandbox init OK for project', name);
        }
      } catch (e) {
        console.warn('[WorkspaceController] Sandbox init error:', e);
      }
    };

    if (project && lastInitialisedProjectRef.current !== project) {
      lastInitialisedProjectRef.current = project;
      initSandbox(project).catch(() => {});
    }
  }, [project]);

  // Memoized event handlers
  const handleSendChatMessage = useCallback(async () => {
    const message = workspace.aiChatInput.trim();
    if (!message) return;

    if (!workspace.aiEnabled) {
      workspace.addChatMessage('AI is disabled. Please enable it first.', 'system');
      return;
    }

    // Map UI model to backend model ids expected by API
    let backendModel: 'kimi2' | 'gpt5' | 'claude' = 'kimi2';
    if (aiModel.includes('gpt-5')) backendModel = 'gpt5';
    else if (aiModel.includes('anthropic')) backendModel = 'claude';
    else backendModel = 'kimi2';

    await workspace.sendMessage(message, project || undefined, backendModel);
  }, [workspace, project, aiModel]);

  const handleRefreshSandbox = useCallback(async () => {
    if (!workspace.sandboxData) {
      workspace.addChatMessage('No active sandbox to refresh. Create a sandbox first!', 'system');
      return;
    }

    try {
      workspace.addChatMessage('Refreshing sandbox...', 'system');
      await workspace.checkSandboxStatus();
      workspace.addChatMessage('Sandbox refreshed successfully!', 'system');
    } catch (error: any) {
      workspace.addChatMessage(`Failed to refresh sandbox: ${error.message}`, 'system');
    }
  }, [workspace]);

  // Memoized header props
  const headerProps = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      aiModel,
      setAiModel,
      sandboxData: workspace.sandboxData,
      status: workspace.status,
      onRefreshSandbox: handleRefreshSandbox,
    }),
    [
      activeTab,
      setActiveTab,
      aiModel,
      setAiModel,
      workspace.sandboxData,
      workspace.status,
      handleRefreshSandbox,
    ]
  );

  const chatPanelProps = useMemo(
    () => ({
      conversationContext: workspace.conversationContext,
      chatMessages: workspace.chatMessages,
      aiChatInput: workspace.aiChatInput,
      aiEnabled: workspace.aiEnabled,
      isGenerating: workspace.isGenerating,
      generationProgress: workspace.generationProgress,
      codeApplicationState: workspace.codeApplicationState,
      chatMessagesRef: workspace.chatMessagesRef,
      onInputChange: workspace.setAiChatInput,
      onSendMessage: handleSendChatMessage,
      // sessions
      sessions: workspace.sessions,
      currentSession: workspace.currentSession,
      onSelectSession: (name: string) => workspace.loadSession(name),
      onCreateSession: (name: string) => workspace.createSession(name),
      onDeleteSession: async (name: string) => {
        console.debug('[WorkspaceController] Request delete session', name);
        // If deleting current, switch selection first to avoid UI race
        if (workspace.currentSession === name) {
          const fallback = workspace.sessions.find(s => s !== name);
          if (fallback) await workspace.loadSession(fallback);
        }
        await workspace.deleteSession(name);
        console.debug('[WorkspaceController] Delete session completed', name);
      },
      onClearHistory: () => workspace.clearChatHistory(),
      isSessionsVisible: workspace.isSessionsVisible,
      setIsSessionsVisible: workspace.setIsSessionsVisible,
    }),
    [
      workspace.conversationContext,
      workspace.chatMessages,
      workspace.aiChatInput,
      workspace.aiEnabled,
      workspace.isGenerating,
      workspace.generationProgress,
      workspace.codeApplicationState,
      workspace.chatMessagesRef,
      workspace.setAiChatInput,
      handleSendChatMessage,
      workspace.sessions,
      workspace.currentSession,
      workspace.isSessionsVisible,
    ]
  );

  const previewPanelProps = useMemo(
    () => ({
      activeTab,
      generationProgress: workspace.generationProgress,
      loadingStage: workspace.loadingStage,
      sandboxData: workspace.sandboxData,
      urlScreenshot: workspace.urlScreenshot,
      isCapturingScreenshot: workspace.isCapturingScreenshot,
      isPreparingDesign: workspace.isPreparingDesign,
      targetUrl: workspace.targetUrl,
      screenshotError: workspace.screenshotError,
      loading: workspace.loading,
      iframeRef,
      onTabChange: setActiveTab,
      onRefreshSandbox: handleRefreshSandbox,
    }),
    [
      activeTab,
      workspace.generationProgress,
      workspace.loadingStage,
      workspace.sandboxData,
      workspace.urlScreenshot,
      workspace.isCapturingScreenshot,
      workspace.isPreparingDesign,
      workspace.targetUrl,
      workspace.screenshotError,
      workspace.loading,
      setActiveTab,
      handleRefreshSandbox,
    ]
  );

  return children({
    activeTab,
    setActiveTab,
    aiModel,
    setAiModel,
    iframeRef,
    headerProps,
    chatPanelProps,
    previewPanelProps,
    project: project || undefined,
    sandboxStatus: workspace.status, // Pass sandbox status
  });
}
