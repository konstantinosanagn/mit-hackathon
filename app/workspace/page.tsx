'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { appConfig } from '@/config/app.config';
import { ActiveTab } from '@/types/app';

// Custom hooks
import { useSandbox } from '@/hooks/useSandbox';
import { useChat } from '@/hooks/useChat';
import { useCodeGeneration } from '@/hooks/useCodeGeneration';
import { useHomeScreen } from '@/hooks/useHomeScreen';
import { useFileExplorer } from '@/hooks/useFileExplorer';

// Components
import Header from '@/components/Header';
import ChatPanel from '@/components/ChatPanel';
import PreviewPanel from '@/components/PreviewPanel';

export default function WorkspacePage() {
  // Custom hooks for state management
  const {
    sandboxData,
    loading,
    status,
    structureContent,
    sandboxFiles,
    fileStructure,
    updateStatus,
    log,
    checkSandboxStatus,
    createSandbox,
    displayStructure,
    fetchSandboxFiles,
    restartViteServer,
    downloadZip,
  } = useSandbox();

  const {
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
    recentMessages,
  } = useChat();

  const {
    promptInput,
    setPromptInput,
    generationProgress,
    setGenerationProgress,
    codeApplicationState,
    setCodeApplicationState,
    codeDisplayRef,
    applyGeneratedCode,
    reapplyLastGeneration,
  } = useCodeGeneration();

  const {
    showHomeScreen,
    setShowHomeScreen,
    homeScreenFading,
    setHomeScreenFading,
    homeUrlInput,
    setHomeUrlInput,
    homeContextInput,
    setHomeContextInput,
    showStyleSelector,
    setShowStyleSelector,
    selectedStyle,
    setSelectedStyle,
    showLoadingBackground,
    setShowLoadingBackground,
    urlScreenshot,
    setUrlScreenshot,
    isCapturingScreenshot,
    setIsCapturingScreenshot,
    screenshotError,
    setScreenshotError,
    isPreparingDesign,
    setIsPreparingDesign,
    targetUrl,
    setTargetUrl,
    loadingStage,
    setLoadingStage,
    captureUrlScreenshot,
    closeHomeScreen,
    clearHomeScreenStates,
  } = useHomeScreen();

  const {
    expandedFolders,
    setExpandedFolders,
    selectedFile,
    setSelectedFile,
    toggleFolder,
    handleFileClick,
    getFileIcon,
  } = useFileExplorer();

  // Local state
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const searchParams = useSearchParams();
  
  // Memoized AI model initialization
  const [aiModel, setAiModel] = useState(() => {
    const modelParam = searchParams.get('model');
    return appConfig.ai.availableModels.includes(modelParam || '') ? modelParam! : appConfig.ai.defaultModel;
  });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Memoized URL parameters processing
  const urlParams = useMemo(() => ({
    url: searchParams.get('url'),
    context: searchParams.get('context'),
    style: searchParams.get('style'),
  }), [searchParams]);

  // Handle URL parameters from home page
  useEffect(() => {
    const { url: urlParam, context: contextParam, style: styleParam } = urlParams;
    
    if (urlParam) {
      setHomeUrlInput(urlParam);
      setTargetUrl(urlParam);
      // Auto-start the website cloning process
      setTimeout(() => {
        handleCloneWebsite(urlParam, contextParam || '', styleParam || '');
      }, 100);
    }
    
    if (contextParam) {
      setHomeContextInput(contextParam);
    }
    
    if (styleParam) {
      setSelectedStyle(styleParam);
    }
  }, [urlParams]);

  // Initialize workspace on mount
  useEffect(() => {
    const initializeWorkspace = async () => {
      // Wait a bit for the sandbox status to be checked first
      setTimeout(async () => {
        // Only create sandbox if we don't have one and we're not already loading
        if (!sandboxData && !loading && status.type === 'disconnected') {
          console.log('[workspace] No sandbox found, creating new sandbox...');
          try {
            await createSandbox();
          } catch (error) {
            console.error('[workspace] Failed to create sandbox:', error);
          }
        }
      }, 2000); // Increased delay to allow status checks to complete
    };
    
    initializeWorkspace();
  }, [sandboxData, loading, status.type]); // Add dependencies to prevent unnecessary calls

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSendChatMessage = useCallback(async () => {
    const message = aiChatInput.trim();
    if (!message) return;
    
    if (!aiEnabled) {
      addChatMessage('AI is disabled. Please enable it first.', 'system');
      return;
    }
    
    addChatMessage(message, 'user');
    setAiChatInput('');
    
    // Check for special commands
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'check packages' || lowerMessage === 'install packages' || lowerMessage === 'npm install') {
      if (!sandboxData) {
        addChatMessage('No active sandbox. Create a sandbox first!', 'system');
        return;
      }
      addChatMessage('Sandbox is ready. Vite configuration is handled by the template.', 'system');
      return;
    }
    
    // Start sandbox creation in parallel if needed
    let sandboxPromise: Promise<void> | null = null;
    let sandboxCreating = false;
    
    if (!sandboxData && !loading && status.type === 'disconnected') {
      sandboxCreating = true;
      addChatMessage('Creating sandbox while I plan your app...', 'system');
      sandboxPromise = createSandbox(true).catch((error: any) => {
        addChatMessage(`Failed to create sandbox: ${error.message}`, 'system');
        throw error;
      });
    }
    
    // Determine if this is an edit
    const isEdit = conversationContext.appliedCode.length > 0;
    
    try {
      // Set generation progress
      setGenerationProgress(prev => ({
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
        files: prev.files
      }));
      
      const fullContext = {
        sandboxId: sandboxData?.sandboxId || (sandboxCreating ? 'pending' : null),
        structure: structureContent,
        recentMessages: recentMessages, // Use memoized recent messages
        conversationContext: conversationContext,
        currentCode: promptInput,
        sandboxUrl: sandboxData?.url,
        sandboxCreating: sandboxCreating
      };
      
      const response = await fetch('/api/generate-ai-code-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          model: aiModel,
          context: fullContext,
          isEdit: conversationContext.appliedCode.length > 0
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Handle streaming response (simplified for this example)
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
                  
                  // Save the last generated code
                  updateConversationContext({
                    lastGeneratedCode: generatedCode
                  });
                  
                  setGenerationProgress(prev => ({
                    ...prev,
                    isGenerating: false,
                    isStreaming: false,
                    status: 'Generation complete!',
                    isThinking: false,
                    thinkingText: undefined,
                    thinkingDuration: undefined
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
          addChatMessage(
            explanation || `Updated ${editedFileNames}`,
            'ai',
            {
              appliedFiles: [generatedFiles[0]]
            }
          );
        } else {
          addChatMessage(explanation || 'Code generated!', 'ai', {
            appliedFiles: generatedFiles
          });
        }
        
        setPromptInput(generatedCode);
        
        // Wait for sandbox creation if it's still in progress
        if (sandboxPromise) {
          addChatMessage('Waiting for sandbox to be ready...', 'system');
          try {
            await sandboxPromise;
            setChatMessages(prev => prev.filter(msg => msg.content !== 'Waiting for sandbox to be ready...'));
          } catch {
            addChatMessage('Sandbox creation failed. Cannot apply code.', 'system');
            return;
          }
        }
        
        if (sandboxData && generatedCode) {
          await applyGeneratedCode(
            generatedCode, 
            isEdit, 
            sandboxData, 
            addChatMessage, 
            updateConversationContext, 
            iframeRef,
            conversationContext
          );
        }
      }
      
      // Show completion status briefly then switch to preview
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: 'Generation complete!',
        isEdit: prev.isEdit,
        isThinking: false,
        thinkingText: undefined,
        thinkingDuration: undefined
      }));
      
      setTimeout(() => {
        setActiveTab('preview');
      }, 1000);
    } catch (error: any) {
      setChatMessages(prev => prev.filter(msg => msg.content !== 'Thinking...'));
      addChatMessage(`Error: ${error.message}`, 'system');
      setGenerationProgress({
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
        lastProcessedPosition: 0
      });
      setActiveTab('preview');
    }
  }, [aiChatInput, aiEnabled, sandboxData, conversationContext, structureContent, recentMessages, promptInput, aiModel, createSandbox, addChatMessage, setGenerationProgress, updateConversationContext, setChatMessages, applyGeneratedCode, setActiveTab]);

  const handleNewProjectClick = useCallback(() => {
    console.log('New Project button clicked');
    // Add your new project logic here
  }, []);

  const handleCloneWebsite = useCallback(async (url: string, context: string, style: string) => {
    if (!url) return;
    
    let fullUrl = url;
    if (!url.match(/^https?:\/\//i)) {
      fullUrl = 'https://' + url;
    }
    
    setTargetUrl(fullUrl);
    addChatMessage(`Starting to clone ${fullUrl.replace(/^https?:\/\//i, '')}...`, 'system');
    
    // Capture screenshot immediately and switch to preview tab
    captureUrlScreenshot(fullUrl);
    
    try {
      addChatMessage('Scraping website content...', 'system');
      const scrapeResponse = await fetch('/api/scrape-url-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl })
      });
      
      if (!scrapeResponse.ok) {
        throw new Error(`Scraping failed: ${scrapeResponse.status}`);
      }
      
      const scrapeData = await scrapeResponse.json();
      
      if (!scrapeData.success) {
        throw new Error(scrapeData.error || 'Failed to scrape website');
      }
      
      addChatMessage(`Scraped ${scrapeData.content.length} characters from ${fullUrl}`, 'system');
      
      // Clear preparing design state and switch to generation tab
      setIsPreparingDesign(false);
      setActiveTab('generation');
      
      setConversationContext(prev => ({
        ...prev,
        scrapedWebsites: [...prev.scrapedWebsites, {
          url: fullUrl,
          content: scrapeData,
          timestamp: new Date()
        }],
        currentProject: `Clone of ${fullUrl}`
      }));
      
      // Start sandbox creation in parallel with code generation
      let sandboxPromise: Promise<void> | null = null;
      if (!sandboxData) {
        addChatMessage('Creating sandbox while generating your React app...', 'system');
        sandboxPromise = createSandbox(true);
      }
      
      addChatMessage('Analyzing and generating React recreation...', 'system');
      
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
      
      setGenerationProgress(prev => ({
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
        lastProcessedPosition: 0
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
            sandboxId: sandboxData?.id,
            structure: structureContent,
            conversationContext: conversationContext
          }
        })
      });
      
      if (!aiResponse.ok) {
        throw new Error(`AI generation failed: ${aiResponse.status}`);
      }
      
      // Handle streaming response (simplified)
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
                  
                  // Save the last generated code
                  setConversationContext(prev => ({
                    ...prev,
                    lastGeneratedCode: generatedCode
                  }));
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e);
              }
            }
          }
        }
      }
      
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: 'Generation complete!'
      }));
      
      if (generatedCode) {
        addChatMessage('AI recreation generated!', 'system');
        
        // Add the explanation to chat if available
        if (explanation && explanation.trim()) {
          addChatMessage(explanation, 'ai');
        }
        
        setPromptInput(generatedCode);
        
        // Wait for sandbox creation if it's still in progress
        if (sandboxPromise) {
          addChatMessage('Waiting for sandbox to be ready...', 'system');
          try {
            await sandboxPromise;
            setChatMessages(prev => prev.filter(msg => msg.content !== 'Waiting for sandbox to be ready...'));
          } catch (error: any) {
            addChatMessage('Sandbox creation failed. Cannot apply code.', 'system');
            throw error;
          }
        }
        
        // First application for cloned site should not be in edit mode
        await applyGeneratedCode(generatedCode, false, sandboxData, addChatMessage, updateConversationContext, iframeRef, conversationContext);
        
        addChatMessage(
          `Successfully recreated ${fullUrl} as a modern React app${context ? ` with your requested context: "${context}"` : ''}! The scraped content is now in my context, so you can ask me to modify specific sections or add features based on the original site.`, 
          'ai',
          {
            scrapedUrl: fullUrl,
            scrapedContent: scrapeData,
            generatedCode: generatedCode
          }
        );
        
        setConversationContext(prev => ({
          ...prev,
          generatedComponents: [],
          appliedCode: [...prev.appliedCode, {
            files: [],
            timestamp: new Date()
          }]
        }));
      } else {
        throw new Error('Failed to generate recreation');
      }
      
      setHomeContextInput('');
      
      // Clear generation progress and all screenshot/design states
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: 'Generation complete!'
      }));
      
      // Clear screenshot and preparing design states to prevent them from showing on next run
      setUrlScreenshot(null);
      setIsPreparingDesign(false);
      setTargetUrl('');
      setScreenshotError(null);
      setLoadingStage(null);
      
      setTimeout(() => {
        // Switch back to preview tab but keep files
        setActiveTab('preview');
      }, 1000);
    } catch (error: any) {
      addChatMessage(`Failed to clone website: ${error.message}`, 'system');
      setIsPreparingDesign(false);
      // Also clear generation progress on error
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: '',
        // Keep files to display in sidebar
        files: prev.files
      }));
    }
  }, [addChatMessage, captureUrlScreenshot, setConversationContext, sandboxData, createSandbox, setGenerationProgress, aiModel, structureContent, conversationContext, applyGeneratedCode, setActiveTab]);

  const handleModelChange = useCallback((model: string) => {
    setAiModel(model);
  }, []);

  const handleRefreshSandbox = useCallback(() => {
    if (iframeRef.current && sandboxData?.url) {
      console.log('[Manual Refresh] Forcing iframe reload...');
      const newSrc = `${sandboxData.url}?t=${Date.now()}&manual=true`;
      iframeRef.current.src = newSrc;
    }
  }, [sandboxData?.url]);

  const handleReapplyLastGeneration = useCallback(async () => {
    await reapplyLastGeneration(
      conversationContext,
      sandboxData,
      addChatMessage,
      updateConversationContext,
      applyGeneratedCode,
      iframeRef
    );
  }, [reapplyLastGeneration, conversationContext, sandboxData, addChatMessage, updateConversationContext, applyGeneratedCode]);

  const handleDownloadZip = useCallback(async () => {
    try {
      await downloadZip();
        addChatMessage(
          'Your Vite app has been downloaded! To run it locally:\n' +
          '1. Unzip the file\n' +
          '2. Run: npm install\n' +
          '3. Run: npm run dev\n' +
          '4. Open http://localhost:5173',
          'system'
        );
    } catch (error: any) {
      addChatMessage(`Failed to create ZIP: ${error.message}`, 'system');
    }
  }, [downloadZip, addChatMessage]);

  // Memoized component props to prevent unnecessary re-renders
  const headerProps = useMemo(() => ({
    aiModel,
    status,
    sandboxData,
    conversationContext,
    onModelChange: handleModelChange,
    onCreateSandbox: () => createSandbox(),
    onReapplyLastGeneration: handleReapplyLastGeneration,
    onDownloadZip: handleDownloadZip,
    onRefreshStatus: checkSandboxStatus,
  }), [aiModel, status, sandboxData, conversationContext, handleModelChange, createSandbox, handleReapplyLastGeneration, handleDownloadZip, checkSandboxStatus]);

  const chatPanelProps = useMemo(() => ({
    conversationContext,
    chatMessages,
    aiChatInput,
    aiEnabled,
    generationProgress,
    codeApplicationState,
    chatMessagesRef,
    onInputChange: setAiChatInput,
    onSendMessage: handleSendChatMessage,
  }), [conversationContext, chatMessages, aiChatInput, aiEnabled, generationProgress, codeApplicationState, setAiChatInput, handleSendChatMessage]);

  const previewPanelProps = useMemo(() => ({
    activeTab,
    generationProgress,
    loadingStage,
    sandboxData,
    urlScreenshot,
    isCapturingScreenshot,
    isPreparingDesign,
    targetUrl,
    screenshotError,
    loading,
    iframeRef,
    onTabChange: setActiveTab,
    onRefreshSandbox: handleRefreshSandbox,
  }), [activeTab, generationProgress, loadingStage, sandboxData, urlScreenshot, isCapturingScreenshot, isPreparingDesign, targetUrl, screenshotError, loading, setActiveTab, handleRefreshSandbox]);

  return (
    <div className="font-sans bg-background text-foreground h-screen flex flex-col">
      {/* Header */}
      <Header {...headerProps} />

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <ChatPanel {...chatPanelProps} />

        {/* Preview Panel */}
        <PreviewPanel {...previewPanelProps} />
      </div>
    </div>
  );
}
