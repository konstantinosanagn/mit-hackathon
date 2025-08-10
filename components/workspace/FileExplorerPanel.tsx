"use client";

import { useState } from 'react';
import FileTreeViewer from './FileTreeViewer';
import FileContentViewer from './FileContentViewer';
import FileUploadModal from './FileUploadModal';
import { useTerminal } from '@/hooks/useTerminal';

interface FileExplorerPanelProps {
  project: string;
}

export default function FileExplorerPanel({ project }: FileExplorerPanelProps) {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { openTerminal } = useTerminal();

  const handleUploadComplete = () => {
    // Refresh the file tree by triggering a re-render
    setSelected(selected); // This will trigger useEffect in FileTreeViewer
  };

  return (
    <div className="flex h-full pl-4">
      <div className="w-60 border-r border-gray-200 overflow-auto">
        {/* Header with upload button */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Files</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={openTerminal}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="Open Terminal"
              >
                💻
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="Upload files"
              >
                📤
              </button>
            </div>
          </div>
        </div>
        
        <FileTreeViewer project={project} selectedPath={selected} onSelect={setSelected} />
      </div>
      <div className="flex-1 overflow-auto">
        <FileContentViewer project={project} filePath={selected} />
      </div>
      
      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        currentPath="/"
      />
    </div>
  );
}
