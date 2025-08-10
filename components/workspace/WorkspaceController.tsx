'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { appConfig } from '@/config/app.config';
import { ActiveTab } from '@/types/app';
import { useWorkspace } from './WorkspaceProvider';

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
  }) => React.ReactNode;
}

export default function WorkspaceController({ children }: WorkspaceControllerProps) {
  const workspace = useWorkspace();
  const searchParams = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Local state
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [aiModel, setAiModel] = useState(() => {
    const modelParam = searchParams.get('model');
    return appConfig.ai.availableModels.includes(modelParam || '')
      ? modelParam!
      : appConfig.ai.defaultModel;
  });

  // Memoized URL parameters processing
  const urlParams = useMemo(
    () => ({
      url: searchParams.get('url'),
      context: searchParams.get('context'),
      style: searchParams.get('style'),
    }),
    [searchParams]
  );

  // Handle URL parameters from home page
  useEffect(() => {
    const { url: urlParam, context: contextParam, style: styleParam } = urlParams;

    if (urlParam) {
      workspace.setHomeUrlInput(urlParam);
      workspace.setTargetUrl(urlParam);
    }

    if (contextParam) {
      workspace.setHomeContextInput(contextParam);
    }

    if (styleParam) {
      workspace.setSelectedStyle(styleParam);
    }
  }, [urlParams, workspace]);

  // Initialize workspace on mount
  useEffect(() => {
    const initializeWorkspace = async () => {
      setTimeout(async () => {
        if (!workspace.sandboxData && !workspace.loading && workspace.status.type === 'disconnected') {
          console.log('[workspace] No sandbox found, creating new sandbox...');
          try {
            await workspace.createSandbox();
          } catch (error) {
            console.error('[workspace] Failed to create sandbox:', error);
          }
        }
      }, 2000);
    };

    initializeWorkspace();
  }, [workspace.sandboxData, workspace.loading, workspace.status.type, workspace.createSandbox]);

  // Memoized event handlers
  const handleSendChatMessage = useCallback(async () => {
    const message = workspace.aiChatInput.trim();
    if (!message) return;

    if (!workspace.aiEnabled) {
      workspace.addChatMessage('AI is disabled. Please enable it first.', 'system');
      return;
    }

    workspace.addChatMessage(message, 'user');
    workspace.setAiChatInput('');

    // Check for special commands
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'check packages' || lowerMessage === 'install packages' || lowerMessage === 'npm install') {
      if (!workspace.sandboxData) {
        workspace.addChatMessage('No active sandbox. Create a sandbox first!', 'system');
        return;
      }
      workspace.addChatMessage('Sandbox is ready. Vite configuration is handled by the template.', 'system');
      return;
    }

    // Start sandbox creation in parallel if needed
    let sandboxPromise: Promise<void> | null = null;
    let sandboxCreating = false;

    if (!workspace.sandboxData && !workspace.loading && workspace.status.type === 'disconnected') {
      sandboxCreating = true;
      workspace.addChatMessage('Creating sandbox while I plan your app...', 'system');
      sandboxPromise = workspace.createSandbox(true).catch((error: any) => {
        workspace.addChatMessage(`Failed to create sandbox: ${error.message}`, 'system');
        throw error;
      });
    }

    // Determine if this is an edit
    const isEdit = workspace.conversationContext.appliedCode.length > 0;

    try {
      // Set generation progress
      workspace.setGenerationProgress(prev => ({
        ...prev,
        isGenerating: true,
        status: 'Starting AI generation...',
        components: [],
        currentComponent: 0,
        streamedCode: '',
        isStreaming: false,
        isThinking: true,
        thinkingText: 'Analyzing your request...',
        thinkingDuration: undefined,
        currentFile: undefined,
        lastProcessedPosition: 0,
        isEdit: isEdit,
        files: prev.files,
      }));

      const fullContext = {
        sandboxId: workspace.sandboxData?.sandboxId || (sandboxCreating ? 'pending' : null),
        structure: workspace.structureContent,
        recentMessages: workspace.chatMessages.slice(-20),
        conversationContext: workspace.conversationContext,
        currentCode: workspace.promptInput,
        sandboxUrl: workspace.sandboxData?.url,
        sandboxCreating: sandboxCreating,
      };

      const response = await fetch('/api/generate-ai-code-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          model: aiModel,
          context: fullContext,
          isEdit: workspace.conversationContext.appliedCode.length > 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let generatedCode = '';
      let explanation = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'complete') {
                  generatedCode = data.generatedCode;
                  explanation = data.explanation;

                  workspace.setGenerationProgress(prev => ({
                    ...prev,
                    isGenerating: false,
                    isStreaming: false,
                    status: 'Generation complete!',
                    isThinking: false,
                    thinkingText: undefined,
                    thinkingDuration: undefined,
                  }));
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }

      if (generatedCode) {
        // Parse files from generated code for metadata
        const fileRegex = /<file path="([^"]+)">([^]*?)<\/file>/g;
        const generatedFiles = [];
        let match;
        while ((match = fileRegex.exec(generatedCode)) !== null) {
          generatedFiles.push(match[1]);
        }

        // Show appropriate message based on edit mode
        if (isEdit && generatedFiles.length > 0) {
          const editedFileNames = generatedFiles.map(f => f.split('/').pop()).join(', ');
          workspace.addChatMessage(explanation || `Updated ${editedFileNames}`, 'ai', {
            appliedFiles: [generatedFiles[0]],
          });
        } else {
          workspace.addChatMessage(explanation || 'Code generated!', 'ai', {
            appliedFiles: generatedFiles,
          });
        }

        workspace.setPromptInput(generatedCode);

        // Wait for sandbox creation if it's still in progress
        if (sandboxPromise) {
          workspace.addChatMessage('Waiting for sandbox to be ready...', 'system');
          try {
            await sandboxPromise;
          } catch {
            workspace.addChatMessage('Sandbox creation failed. Cannot apply code.', 'system');
            return;
          }
        }

        if (workspace.sandboxData && generatedCode) {
          await workspace.applyGeneratedCode(
            generatedCode,
            isEdit,
            workspace.sandboxData,
            workspace.addChatMessage,
            (updates: any) => {
              // Update conversation context
              workspace.conversationContext = { ...workspace.conversationContext, ...updates };
            },
            iframeRef,
            workspace.conversationContext
          );
        }
      }

      // Show completion status briefly then switch to preview
      workspace.setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: 'Generation complete!',
        isEdit: prev.isEdit,
        isThinking: false,
        thinkingText: undefined,
        thinkingDuration: undefined,
      }));

      setTimeout(() => {
        setActiveTab('preview');
      }, 1000);
    } catch (error: any) {
      workspace.addChatMessage(`Error: ${error.message}`, 'system');
      workspace.setGenerationProgress({
        isGenerating: false,
        status: '',
        components: [],
        currentComponent: 0,
        streamedCode: '',
        isStreaming: false,
        isThinking: false,
        thinkingText: undefined,
        thinkingDuration: undefined,
        files: [],
        currentFile: undefined,
        lastProcessedPosition: 0,
      });
      setActiveTab('preview');
    }
  }, [workspace, aiModel]);

  const handleCloneWebsite = useCallback(async (url: string, context: string) => {
    if (!url) return;

    let fullUrl = url;
    if (!url.match(/^https?:\/\//i)) {
      fullUrl = 'https://' + url;
    }

    workspace.setTargetUrl(fullUrl);
    workspace.addChatMessage(`Starting to clone ${fullUrl.replace(/^https?:\/\//i, '')}...`, 'system');

    // Capture screenshot immediately and switch to preview tab
    workspace.captureUrlScreenshot(fullUrl);

    try {
      workspace.addChatMessage('Scraping website content...', 'system');
      const scrapeResponse = await fetch('/api/scrape-url-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });

      if (!scrapeResponse.ok) {
        throw new Error(`Scraping failed: ${scrapeResponse.status}`);
      }

      const scrapeData = await scrapeResponse.json();

      if (!scrapeData.success) {
        throw new Error(scrapeData.error || 'Failed to scrape website');
      }

      workspace.addChatMessage(`Scraped ${scrapeData.content.length} characters from ${fullUrl}`, 'system');

      // Clear preparing design state and switch to generation tab
      workspace.setIsPreparingDesign(false);
      setActiveTab('generation');

      // Update conversation context
      workspace.conversationContext = {
        ...workspace.conversationContext,
        scrapedWebsites: [
          ...workspace.conversationContext.scrapedWebsites,
          {
            url: fullUrl,
            content: scrapeData,
            timestamp: new Date(),
          },
        ],
        currentProject: `Clone of ${fullUrl}`,
      };

      // Start sandbox creation in parallel with code generation
      let sandboxPromise: Promise<void> | null = null;
      if (!workspace.sandboxData) {
        workspace.addChatMessage('Creating sandbox while generating your React app...', 'system');
        sandboxPromise = workspace.createSandbox(true);
      }

      workspace.addChatMessage('Analyzing and generating React recreation...', 'system');

      const recreatePrompt = `I scraped this website and want you to recreate it as a modern React application.

URL: ${fullUrl}

SCRAPED CONTENT:
${scrapeData.content}

${context ? `ADDITIONAL CONTEXT/REQUIREMENTS FROM USER:
${context}

Please incorporate these requirements into the design and implementation.` : ''}

REQUIREMENTS:
1. Create a COMPLETE React application with App.jsx as the main component
2. App.jsx MUST import and render all other components
3. Recreate the main sections and layout from the scraped content
4. ${context ? `Apply the user's context/theme: "${context}"` : `Use a modern dark theme with excellent contrast:
   - Background: #0a0a0a
   - Text: #ffffff
   - Links: #60a5fa
   - Accent: #3b82f6`}
5. Make it fully responsive
6. Include hover effects and smooth transitions
7. Create separate components for major sections (Header, Hero, Features, etc.)
8. Use semantic HTML5 elements

IMPORTANT CONSTRAINTS:
- DO NOT use React Router or any routing libraries
- Use regular <a> tags with href="#section" for navigation, NOT Link or NavLink components
- This is a single-page application, no routing needed
- ALWAYS create src/App.jsx that imports ALL components
- Each component should be in src/components/
- Use Tailwind CSS for ALL styling (no custom CSS files)
- Make sure the app actually renders visible content
- Create ALL components that you reference in imports

IMAGE HANDLING RULES:
- When the scraped content includes images, USE THE ORIGINAL IMAGE URLS whenever appropriate
- Keep existing images from the scraped site (logos, product images, hero images, icons, etc.)
- Use the actual image URLs provided in the scraped content, not placeholders
- Only use placeholder images or generic services when no real images are available
- For company logos and brand images, ALWAYS use the original URLs to maintain brand identity
- If scraped data contains image URLs, include them in your img tags
- Example: If you see "https://example.com/logo.png" in the scraped content, use that exact URL

Focus on the key sections and content, making it clean and modern while preserving visual assets.`;

      workspace.setGenerationProgress(prev => ({
        isGenerating: true,
        status: 'Initializing AI...',
        components: [],
        currentComponent: 0,
        streamedCode: '',
        isStreaming: true,
        isThinking: false,
        thinkingText: undefined,
        thinkingDuration: undefined,
        files: prev.files || [],
        currentFile: undefined,
        lastProcessedPosition: 0,
      }));

      // Switch to generation tab when starting
      setActiveTab('generation');

      const aiResponse = await fetch('/api/generate-ai-code-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: recreatePrompt,
          model: aiModel,
          context: {
            sandboxId: workspace.sandboxData?.id,
            structure: workspace.structureContent,
            conversationContext: workspace.conversationContext,
          },
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI generation failed: ${aiResponse.status}`);
      }

      // Handle streaming response
      const reader = aiResponse.body?.getReader();
      const decoder = new TextDecoder();
      let generatedCode = '';
      let explanation = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'complete') {
                  generatedCode = data.generatedCode;
                  explanation = data.explanation;
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e);
              }
            }
          }
        }
      }

      workspace.setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: 'Generation complete!',
      }));

      if (generatedCode) {
        workspace.addChatMessage('AI recreation generated!', 'system');

        if (explanation && explanation.trim()) {
          workspace.addChatMessage(explanation, 'ai');
        }

        workspace.setPromptInput(generatedCode);

        // Wait for sandbox creation if it's still in progress
        if (sandboxPromise) {
          workspace.addChatMessage('Waiting for sandbox to be ready...', 'system');
          try {
            await sandboxPromise;
          } catch (error: any) {
            workspace.addChatMessage('Sandbox creation failed. Cannot apply code.', 'system');
            throw error;
          }
        }

        // First application for cloned site should not be in edit mode
        await workspace.applyGeneratedCode(
          generatedCode,
          false,
          workspace.sandboxData,
          workspace.addChatMessage,
          (updates: any) => {
            workspace.conversationContext = { ...workspace.conversationContext, ...updates };
          },
          iframeRef,
          workspace.conversationContext
        );

        workspace.addChatMessage(
          `Successfully recreated ${fullUrl} as a modern React app${context ? ` with your requested context: "${context}"` : ''}! The scraped content is now in my context, so you can ask me to modify specific sections or add features based on the original site.`,
          'ai',
          {
            scrapedUrl: fullUrl,
            scrapedContent: scrapeData,
            generatedCode: generatedCode,
          }
        );

        workspace.conversationContext = {
          ...workspace.conversationContext,
          generatedComponents: [],
          appliedCode: [
            ...workspace.conversationContext.appliedCode,
            {
              files: [],
              timestamp: new Date(),
            },
          ],
        };
      } else {
        throw new Error('Failed to generate recreation');
      }

      workspace.setHomeContextInput('');

      // Clear generation progress and all screenshot/design states
      workspace.setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: 'Generation complete!',
      }));

      // Clear screenshot and preparing design states
      workspace.setUrlScreenshot(null);
      workspace.setIsPreparingDesign(false);
      workspace.setTargetUrl('');
      workspace.setScreenshotError(null);
      workspace.setLoadingStage(null);

      setTimeout(() => {
        setActiveTab('preview');
      }, 1000);
    } catch (error: any) {
      workspace.addChatMessage(`Failed to clone website: ${error.message}`, 'system');
      workspace.setIsPreparingDesign(false);
      workspace.setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: '',
        files: prev.files,
      }));
    }
  }, [workspace, aiModel]);

  // Handle website cloning when URL parameters are present
  useEffect(() => {
    const { url: urlParam, context: contextParam } = urlParams;
    
    if (urlParam && handleCloneWebsite) {
      setTimeout(() => {
        handleCloneWebsite(urlParam, contextParam || '');
      }, 100);
    }
  }, [urlParams, handleCloneWebsite]);

  const handleModelChange = useCallback((model: string) => {
    setAiModel(model);
  }, []);

  const handleRefreshSandbox = useCallback(() => {
    if (iframeRef.current && workspace.sandboxData?.url) {
      console.log('[Manual Refresh] Forcing iframe reload...');
      const newSrc = `${workspace.sandboxData.url}?t=${Date.now()}&manual=true`;
      iframeRef.current.src = newSrc;
    }
  }, [workspace.sandboxData?.url]);

  const handleReapplyLastGeneration = useCallback(async () => {
    await workspace.reapplyLastGeneration(
      workspace.conversationContext,
      workspace.sandboxData,
      workspace.addChatMessage,
      (updates: any) => {
        workspace.conversationContext = { ...workspace.conversationContext, ...updates };
      },
      workspace.applyGeneratedCode,
      iframeRef
    );
  }, [workspace]);

  const handleDownloadZip = useCallback(async () => {
    try {
      await workspace.downloadZip();
      workspace.addChatMessage(
        'Your Vite app has been downloaded! To run it locally:\n' +
          '1. Unzip the file\n' +
          '2. Run: npm install\n' +
          '3. Run: npm run dev\n' +
          '4. Open http://localhost:5173',
        'system'
      );
    } catch (error: any) {
      workspace.addChatMessage(`Failed to create ZIP: ${error.message}`, 'system');
    }
  }, [workspace]);

  // Memoized component props
  const headerProps = useMemo(
    () => {
      console.log('[WorkspaceController] Creating headerProps with status:', workspace.status);
      return {
        aiModel,
        status: workspace.status,
        sandboxData: workspace.sandboxData,
        conversationContext: workspace.conversationContext,
        onModelChange: handleModelChange,
        onCreateSandbox: () => workspace.createSandbox(),
        onReapplyLastGeneration: handleReapplyLastGeneration,
        onDownloadZip: handleDownloadZip,
        onRefreshStatus: workspace.checkSandboxStatus,
      };
    },
    [
      aiModel,
      workspace.status,
      workspace.sandboxData,
      workspace.conversationContext,
      handleModelChange,
      workspace.createSandbox,
      handleReapplyLastGeneration,
      handleDownloadZip,
      workspace.checkSandboxStatus,
    ]
  );

  const chatPanelProps = useMemo(
    () => ({
      conversationContext: workspace.conversationContext,
      chatMessages: workspace.chatMessages,
      aiChatInput: workspace.aiChatInput,
      aiEnabled: workspace.aiEnabled,
      generationProgress: workspace.generationProgress,
      codeApplicationState: workspace.codeApplicationState,
      chatMessagesRef: { current: null }, // This should be passed from the hook
      onInputChange: workspace.setAiChatInput,
      onSendMessage: handleSendChatMessage,
    }),
    [
      workspace.conversationContext,
      workspace.chatMessages,
      workspace.aiChatInput,
      workspace.aiEnabled,
      workspace.generationProgress,
      workspace.codeApplicationState,
      workspace.setAiChatInput,
      handleSendChatMessage,
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

  return (
    <>
      {children({
        activeTab,
        setActiveTab,
        aiModel,
        setAiModel,
        iframeRef,
        headerProps,
        chatPanelProps,
        previewPanelProps,
      })}
    </>
  );
}
