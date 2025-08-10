'use client';

import { ActiveTab } from '@/types/app';

interface PreviewTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  generationProgress: any;
  sandboxData: any;
}

export default function PreviewTabs({
  activeTab,
  onTabChange,
  generationProgress,
  sandboxData,
}: PreviewTabsProps) {
  return (
    <div className="px-4 py-2 bg-card border-b border-border flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="flex bg-[#36322F] rounded-lg p-1">
          <button
            onClick={() => onTabChange('generation')}
            className={`p-2 rounded-md transition-all ${
              activeTab === 'generation'
                ? 'bg-black text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            title="Code"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </button>
          <button
            onClick={() => onTabChange('preview')}
            className={`p-2 rounded-md transition-all ${
              activeTab === 'preview'
                ? 'bg-black text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            title="Preview"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        {/* Live Code Generation Status */}
        {activeTab === 'generation' &&
          (generationProgress.isGenerating || generationProgress.files.length > 0) && (
            <div className="flex items-center gap-3">
              {!generationProgress.isEdit && (
                <div className="text-gray-600 text-sm">
                  {generationProgress.files.length} files generated
                </div>
              )}
              <div className="inline-flex items-center justify-center whitespace-nowrap rounded-[10px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#36322F] text-white hover:bg-[#36322F] [box-shadow:inset_0px_-2px_0px_0px_#171310,_0px_1px_6px_0px_rgba(58,_33,_8,_58%)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#171310,_0px_1px_3px_0px_rgba(58,_33,_8,_40%)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#171310,_0px_1px_2px_0px_rgba(58,_33,_8,_30%)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100 h-8 px-3 py-1 text-sm gap-2">
                {generationProgress.isGenerating ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    {generationProgress.isEdit ? 'Editing code' : 'Live code generation'}
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    COMPLETE
                  </>
                )}
              </div>
            </div>
          )}
        {sandboxData && !generationProgress.isGenerating && (
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
            onClick={() => window.open(sandboxData.url, '_blank')}
            title="Open in new tab"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
