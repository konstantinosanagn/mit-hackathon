'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import ChatPanel from '@/components/ChatPanel';
import PreviewPanel from '@/components/PreviewPanel';
import Terminal from './Terminal';
import { useTerminal } from '@/hooks/useTerminal';

interface WorkspaceLayoutProps {
  children?: ReactNode;
  headerProps: any;
  chatPanelProps: any;
  previewPanelProps: any;
  project?: string;
  sandboxStatus?: any; // Add sandbox status prop
}

export default function WorkspaceLayout({
  children,
  headerProps,
  chatPanelProps,
  previewPanelProps,
  project,
  sandboxStatus,
}: WorkspaceLayoutProps) {
  const { isTerminalOpen, toggleTerminal, closeTerminal } = useTerminal();

  return (
    <div className="font-sans bg-background text-foreground h-screen flex flex-col">
      {/* Header */}
      <Header {...headerProps} onToggleTerminal={toggleTerminal} />

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <ChatPanel {...chatPanelProps} />

        {/* Right side: editor/preview with docked terminal */}
        <div className="flex-1 relative overflow-hidden" style={{ paddingBottom: '20rem' }}>
          <PreviewPanel {...previewPanelProps} project={project} />
          <Terminal 
            isOpen={true}
            onToggle={toggleTerminal}
            onMinimize={closeTerminal}
            onMaximize={closeTerminal}
            sandboxStatus={sandboxStatus}
            project={project}
            layoutMode="dock-bottom"
          />
        </div>
      </div>
      
      {children}

      {/* Docked terminal replaces global terminal/toggle */}
    </div>
  );
}
