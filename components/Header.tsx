'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getAvailableModels, AvailableModel } from '@/lib/aiApi';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConversationContext, SandboxStatus } from '@/types/app';
import { useNetworkStatus } from '@/lib/network';
import StatusBar from './StatusBar';
import CreateSandboxButton from './CreateSandboxButton';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
  status: SandboxStatus;
  sandboxData: any;
  onRefreshSandbox: () => void;
  onToggleTerminal?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  aiModel,
  setAiModel,
  status,
  sandboxData,
  onRefreshSandbox,
  onToggleTerminal,
}: HeaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const networkStatus = useNetworkStatus();
  const [modelOptions, setModelOptions] = useState<AvailableModel[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const models = await getAvailableModels();
        setModelOptions(models);
      } catch (e) {
        console.warn('[Header] Failed to fetch models', e);
        // Fallback defaults
        setModelOptions([
          { label: 'Kimi K2 Instruct', provider: 'moonshotai', model_id: 'moonshotai/kimi-k2-instruct' },
          { label: 'GPT-5', provider: 'openai', model_id: 'openai/gpt-5' },
          { label: 'Sonnet 4', provider: 'anthropic', model_id: 'anthropic/claude-sonnet-4-20250514' },
        ]);
      }
    })();
  }, []);

  const handleModelChange = (model: string) => {
    setAiModel(model);
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
        {/* Terminal Button */}
        {onToggleTerminal && (
          <button
            onClick={onToggleTerminal}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-[10px] transition-colors flex items-center gap-2"
            title="Toggle Terminal"
          >
            💻 Terminal
          </button>
        )}

        {/* Model Selector */}
        <select
          value={aiModel}
          onChange={e => handleModelChange(e.target.value)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#36322F] focus:border-transparent"
          disabled={!networkStatus.isOnline}
        >
          {modelOptions.map(m => (
            <option key={m.model_id} value={m.model_id}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Status Bar Component */}
        <StatusBar status={status} onRefreshStatus={onRefreshSandbox} />
      </div>
    </div>
  );
}
