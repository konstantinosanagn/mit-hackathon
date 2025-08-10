'use client';

import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConversationContext, SandboxStatus } from '@/types/app';
import { useNetworkStatus } from '@/lib/network';
import StatusBar from './StatusBar';
import CreateSandboxButton from './CreateSandboxButton';

interface HeaderProps {
  aiModel: string;
  status: SandboxStatus;
  sandboxData: any;
  conversationContext: ConversationContext;
  onModelChange: (model: string) => void;
  onCreateSandbox: () => void;
  onReapplyLastGeneration: () => void;
  onDownloadZip: () => void;
  onRefreshStatus?: () => void;
}

export default function Header({
  aiModel,
  status,
  sandboxData,
  conversationContext,
  onModelChange,
  onCreateSandbox,
  onReapplyLastGeneration,
  onDownloadZip,
  onRefreshStatus,
}: HeaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const networkStatus = useNetworkStatus();

  const handleModelChange = (model: string) => {
    onModelChange(model);
    const params = new URLSearchParams(searchParams);
    params.set('model', model);
    if (sandboxData?.sandboxId) {
      params.set('sandbox', sandboxData.sandboxId);
    }
    router.push(`/workspace?${params.toString()}`);
  };

  return (
    <div className="bg-card px-6 py-4 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className="h-8 flex items-center text-[#36322F] font-semibold text-lg cursor-pointer hover:text-[#171310] transition-colors"
          onClick={() => router.push('/')}
          title="Go to Homepage"
        >
          Replicate Hub
        </div>

        {/* Network Status Indicator */}
        {!networkStatus.isOnline && (
          <div className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Offline
          </div>
        )}
      </div>

                        <div className="absolute left-1/2 transform -translate-x-1/2">
                    <a
                      href="/marketplace"
                      className="font-ui font-medium text-lg text-blue-700 hover:text-blue-900 transition-colors duration-200 cursor-pointer tracking-wider flex items-center gap-2 group"
                    >
                      <img 
                        src="/palette-logo.svg"
                        alt="Palette icon"
                        className="w-5 h-5 palette-icon-blue transition-all duration-300 group-hover:rotate-360"
                      />
                      <span className="terminal-text">the_exhibition</span>
                    </a>
                  </div>

      <div className="flex items-center gap-2">
        {/* Model Selector */}
        <select
          value={aiModel}
          onChange={e => handleModelChange(e.target.value)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#36322F] focus:border-transparent"
          disabled={!networkStatus.isOnline}
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
          <option value="claude-3-haiku">Claude 3 Haiku</option>
        </select>

        <CreateSandboxButton
          onClick={onCreateSandbox}
          disabled={!networkStatus.isOnline || status.type === 'creating'}
          isCreating={status.type === 'creating'}
        />

        <Button
          variant="code"
          onClick={onReapplyLastGeneration}
          size="sm"
          title="Re-apply last generation"
          disabled={
            !conversationContext.lastGeneratedCode ||
            !sandboxData ||
            !networkStatus.isOnline ||
            status.type !== 'active'
          }
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </Button>

        <button
          onClick={onDownloadZip}
          disabled={
            !sandboxData || !networkStatus.isOnline || status.type !== 'active'
          }
          className="p-2 text-black hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download your Vite app as ZIP"
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        </button>

        {/* Status Bar Component */}
        <StatusBar status={status} onRefreshStatus={onRefreshStatus} />
      </div>
    </div>
  );
}
