'use client';

import Image from 'next/image';
import { LoadingStage, GenerationProgress } from '@/types/app';

interface PreviewViewProps {
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
  onRefreshSandbox: () => void;
}

export default function PreviewView({
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
  onRefreshSandbox,
}: PreviewViewProps) {
  // Show screenshot when we have one and (loading OR generating OR no sandbox yet)
  if (
    urlScreenshot &&
    (loading || generationProgress.isGenerating || !sandboxData?.url || isPreparingDesign)
  ) {
    return (
      <div className="relative w-full h-full bg-gray-100">
        <Image
          src={urlScreenshot}
          alt="Website preview"
          fill
          className="object-contain"
        />
        {(generationProgress.isGenerating || isPreparingDesign) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center bg-black/70 rounded-lg p-6 backdrop-blur-sm">
              <div className="w-12 h-12 border-3 border-gray-300 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white text-sm font-medium">
                {generationProgress.isGenerating
                  ? 'Generating code...'
                  : `Preparing your design for ${targetUrl}...`}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Check loading stage FIRST to prevent showing old sandbox
  // Don't show loading overlay for edits
  if (loadingStage || (generationProgress.isGenerating && !generationProgress.isEdit)) {
    return (
      <div className="relative w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {loadingStage === 'gathering' && 'Gathering website information...'}
            {loadingStage === 'planning' && 'Planning your design...'}
            {(loadingStage === 'generating' || generationProgress.isGenerating) &&
              'Generating your application...'}
          </h3>
          <p className="text-gray-600 text-sm">
            {loadingStage === 'gathering' &&
              'Analyzing the website structure and content'}
            {loadingStage === 'planning' &&
              'Creating the optimal React component architecture'}
            {(loadingStage === 'generating' || generationProgress.isGenerating) &&
              'Writing clean, modern code for your app'}
          </p>
        </div>
      </div>
    );
  }

  // Show sandbox iframe only when not in any loading state
  if (sandboxData?.url && !loading) {
    return (
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={sandboxData.url}
          className="w-full h-full border-none"
          title="Replicate Hub Sandbox"
          allow="clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
        {/* Refresh button */}
        <button
          onClick={onRefreshSandbox}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
          title="Refresh sandbox"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    );
  }

  // Show loading animation when capturing screenshot
  if (isCapturingScreenshot) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">
            Gathering website information
          </h3>
        </div>
      </div>
    );
  }

  // Default state when no sandbox and no screenshot
  return (
    <div className="flex items-center justify-center h-full bg-gray-50 text-gray-600 text-lg">
      {screenshotError ? (
        <div className="text-center">
          <p className="mb-2">Failed to capture screenshot</p>
          <p className="text-sm text-gray-500">{screenshotError}</p>
        </div>
      ) : sandboxData ? (
        <div className="text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading preview...</p>
        </div>
      ) : (
        <div className="text-gray-500 text-center">
          <p className="text-sm">Start chatting to create your first app</p>
        </div>
      )}
    </div>
  );
}
