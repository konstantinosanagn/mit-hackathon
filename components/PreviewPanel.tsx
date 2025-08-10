'use client';

import { ActiveTab, LoadingStage, GenerationProgress } from '@/types/app';
import PreviewTabs from './preview/PreviewTabs';
import GenerationView from './preview/GenerationView';
import PreviewView from './preview/PreviewView';

interface PreviewPanelProps {
  activeTab: ActiveTab;
  generationProgress: GenerationProgress;
  loadingStage: LoadingStage;
  sandboxData: any;
  urlScreenshot: string | null;
  isCapturingScreenshot: boolean;
  isPreparingDesign: boolean;
  targetUrl: string;
  screenshotError: string | null;
  loading: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onTabChange: (tab: ActiveTab) => void;
  onRefreshSandbox: () => void;
}

export default function PreviewPanel({
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
  onTabChange,
  onRefreshSandbox,
}: PreviewPanelProps) {
  const renderMainContent = () => {
    if (
      activeTab === 'generation' &&
      (generationProgress.isGenerating || generationProgress.files.length > 0)
    ) {
      return <GenerationView generationProgress={generationProgress} />;
    } else if (activeTab === 'preview') {
      return (
        <PreviewView
          generationProgress={generationProgress}
          loadingStage={loadingStage}
          sandboxData={sandboxData}
          urlScreenshot={urlScreenshot}
          isCapturingScreenshot={isCapturingScreenshot}
          isPreparingDesign={isPreparingDesign}
          targetUrl={targetUrl}
          screenshotError={screenshotError}
          loading={loading}
          iframeRef={iframeRef}
          onRefreshSandbox={onRefreshSandbox}
        />
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PreviewTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        generationProgress={generationProgress}
        sandboxData={sandboxData}
      />
      <div className="flex-1 relative overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
  );
}
