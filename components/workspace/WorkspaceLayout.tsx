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

        {/* Preview Panel */}
        <PreviewPanel {...previewPanelProps} project={project} />
      </div>
      
      {children}

      {/* Terminal */}
      <Terminal 
        isOpen={isTerminalOpen}
        onToggle={toggleTerminal}
        onMinimize={closeTerminal}
        onMaximize={closeTerminal}
        sandboxStatus={sandboxStatus}
        project={project}
      />

      {/* Terminal Toggle Button - Fixed position */}
      <button
        onClick={toggleTerminal}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-200 ${
          isTerminalOpen 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        title={isTerminalOpen ? 'Close Terminal' : 'Open Terminal'}
      >
        {isTerminalOpen ? '✕' : '💻'}
      </button>
    </div>
  );
}
