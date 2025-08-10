'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { appConfig } from '@/config/app.config';

// Custom hooks
import { useHomeScreen } from '@/hooks/useHomeScreen';

// Components
import HomeScreen from '@/components/HomeScreen';

export default function HomePage() {
  const router = useRouter();
  
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

  // Local state
  const [aiModel, setAiModel] = useState(appConfig.ai.defaultModel);

  const handleNewProjectClick = () => {
    // Navigate to workspace with any URL parameters
    const params = new URLSearchParams();
    if (homeUrlInput) params.set('url', homeUrlInput);
    if (homeContextInput) params.set('context', homeContextInput);
    if (selectedStyle) params.set('style', selectedStyle);
    params.set('model', aiModel);
    
    const queryString = params.toString();
    router.push(`/workspace${queryString ? `?${queryString}` : ''}`);
  };

  const handleModelChange = (model: string) => {
    setAiModel(model);
  };

  return (
    <div className="font-sans bg-background text-foreground h-screen flex flex-col">
      {/* Home Screen Overlay */}
      <HomeScreen
        showHomeScreen={showHomeScreen}
        homeScreenFading={homeScreenFading}
        homeUrlInput={homeUrlInput}
        homeContextInput={homeContextInput}
        aiModel={aiModel}
        onClose={closeHomeScreen}
        onNewProjectClick={handleNewProjectClick}
        onModelChange={handleModelChange}
      />
    </div>
  );
}