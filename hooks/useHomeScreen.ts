import { useState, useEffect } from 'react';
import { LoadingStage } from '@/types/app';

export function useHomeScreen() {
  const [showHomeScreen, setShowHomeScreen] = useState(true);
  const [homeScreenFading, setHomeScreenFading] = useState(false);
  const [homeUrlInput, setHomeUrlInput] = useState('');
  const [homeContextInput, setHomeContextInput] = useState('');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showLoadingBackground, setShowLoadingBackground] = useState(false);
  const [urlScreenshot, setUrlScreenshot] = useState<string | null>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [isPreparingDesign, setIsPreparingDesign] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(null);

  // Handle Escape key for home screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHomeScreen) {
        setHomeScreenFading(true);
        setTimeout(() => {
          setShowHomeScreen(false);
          setHomeScreenFading(false);
        }, 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHomeScreen]);

  const captureUrlScreenshot = async (url: string) => {
    setIsCapturingScreenshot(true);
    setScreenshotError(null);
    try {
      const response = await fetch('/api/scrape-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (data.success && data.screenshot) {
        setUrlScreenshot(data.screenshot);
        // Set preparing design state
        setIsPreparingDesign(true);
        // Store the clean URL for display
        const cleanUrl = url.replace(/^https?:\/\//i, '');
        setTargetUrl(cleanUrl);
      } else {
        setScreenshotError(data.error || 'Failed to capture screenshot');
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      setScreenshotError('Network error while capturing screenshot');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const closeHomeScreen = () => {
    setHomeScreenFading(true);
    setTimeout(() => {
      setShowHomeScreen(false);
      setHomeScreenFading(false);
    }, 500);
  };

  const clearHomeScreenStates = () => {
    setUrlScreenshot(null);
    setIsPreparingDesign(false);
    setTargetUrl('');
    setScreenshotError(null);
    setLoadingStage(null);
    setHomeUrlInput('');
    setHomeContextInput('');
    setShowStyleSelector(false);
    setSelectedStyle(null);
  };

  return {
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
  };
}
