'use client';

import { useState } from 'react';
import { appConfig } from '@/config/app.config';

// Custom hooks
import { useHomeScreen } from '@/hooks/useHomeScreen';

// Components
import HomeScreen from '@/components/HomeScreen';

export default function HomePage() {
  const {
    showHomeScreen,
    homeScreenFading,
    homeUrlInput,
    homeContextInput,
    closeHomeScreen,
  } = useHomeScreen();

  // Local state
  const [aiModel, setAiModel] = useState(appConfig.ai.defaultModel);

  // Navigation now handled in HomeScreen modal implementation

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
        // New project handled internally in HomeScreen
        onModelChange={handleModelChange}
      />
    </div>
  );
}
