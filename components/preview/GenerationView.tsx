'use client';

import { GenerationProgress } from '@/types/app';

interface GenerationViewProps {
  generationProgress: GenerationProgress;
}

export default function GenerationView({ generationProgress }: GenerationViewProps) {
  return (
    <div className="absolute inset-0 flex overflow-hidden">
      {/* File Explorer - Hide during edits */}
      {!generationProgress.isEdit && (
        <div className="w-[250px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
          <div className="p-3 bg-gray-100 text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="text-sm font-medium">Explorer</span>
            </div>
          </div>

          {/* File Tree */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
            <div className="text-sm">
              <div className="text-gray-500 text-center py-4">
                File explorer content would go here
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Thinking Mode Display - Only show during active generation */}
        {generationProgress.isGenerating &&
          (generationProgress.isThinking || generationProgress.thinkingText) && (
            <div className="px-6 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-purple-600 font-medium flex items-center gap-2">
                  {generationProgress.isThinking ? (
                    <>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                      AI is thinking...
                    </>
                  ) : (
                    <>
                      <span className="text-purple-600">✓</span>
                      Thought for {generationProgress.thinkingDuration || 0} seconds
                    </>
                  )}
                </div>
              </div>
              {generationProgress.thinkingText && (
                <div className="bg-purple-950 border border-purple-700 rounded-lg p-4 max-h-48 overflow-y-auto scrollbar-hide">
                  <pre className="text-xs font-mono text-purple-300 whitespace-pre-wrap">
                    {generationProgress.thinkingText}
                  </pre>
                </div>
              )}
            </div>
          )}

        {/* Live Code Display */}
        <div className="flex-1 rounded-lg p-6 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
            <div className="space-y-4">
              {/* Show completed files */}
              {generationProgress.files.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="px-4 py-2 bg-[#36322F] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="font-mono text-sm">{file.path}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        file.type === 'css'
                          ? 'bg-blue-600 text-white'
                          : file.type === 'javascript'
                            ? 'bg-yellow-600 text-white'
                            : file.type === 'json'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {file.type === 'javascript' ? 'JSX' : file.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 max-h-48 overflow-y-auto scrollbar-hide">
                    <pre className="p-4 text-xs font-mono text-gray-300">
                      {file.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        {generationProgress.components.length > 0 && (
          <div className="mx-6 mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
                style={{
                  width: `${(generationProgress.currentComponent / Math.max(generationProgress.components.length, 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
