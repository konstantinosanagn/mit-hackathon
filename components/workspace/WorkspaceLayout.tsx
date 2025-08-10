'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import ChatPanel from '@/components/ChatPanel';
import PreviewPanel from '@/components/PreviewPanel';

interface WorkspaceLayoutProps {
  children?: ReactNode;
  headerProps: any;
  chatPanelProps: any;
  previewPanelProps: any;
}

export default function WorkspaceLayout({
  children,
  headerProps,
  chatPanelProps,
  previewPanelProps,
}: WorkspaceLayoutProps) {
  return (
    <div className="font-sans bg-background text-foreground h-screen flex flex-col">
      {/* Header */}
      <Header {...headerProps} />

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <ChatPanel {...chatPanelProps} />

        {/* Preview Panel */}
        <PreviewPanel {...previewPanelProps} />
      </div>
      
      {children}
    </div>
  );
}
