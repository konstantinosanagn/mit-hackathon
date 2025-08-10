import React from 'react';
import { useState } from 'react';
import {
  FiFile,
  FiChevronRight,
  FiChevronDown,
  BsFolderFill,
  BsFolder2Open,
  SiJavascript,
  SiReact,
  SiCss3,
  SiJson,
} from '../lib/icons';

export function useFileExplorer() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['app', 'src', 'src/components'])
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = async (filePath: string) => {
    setSelectedFile(filePath);
    // TODO: Add file content fetching logic here
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (ext === 'jsx' || ext === 'js') {
      return <SiJavascript className="w-4 h-4 text-yellow-500" />;
    } else if (ext === 'tsx' || ext === 'ts') {
      return <SiReact className="w-4 h-4 text-blue-500" />;
    } else if (ext === 'css') {
      return <SiCss3 className="w-4 h-4 text-blue-500" />;
    } else if (ext === 'json') {
      return <SiJson className="w-4 h-4 text-gray-600" />;
    } else {
      return <FiFile className="w-4 h-4 text-gray-600" />;
    }
  };

  return {
    expandedFolders,
    setExpandedFolders,
    selectedFile,
    setSelectedFile,
    toggleFolder,
    handleFileClick,
    getFileIcon,
  };
}
