"use client";

import { useEffect, useState } from 'react';
import { listFilesWithMetadata, EnhancedFileEntry } from '@/lib/filesApi';
import { getFileIcon, getFileColor, sortFileEntries, filterFiles } from '@/lib/file-utils';

interface FileTreeViewerProps {
  project: string;
  onSelect: (path: string) => void;
  selectedPath?: string;
}

export default function FileTreeViewer({ project, onSelect, selectedPath }: FileTreeViewerProps) {
  const [entries, setEntries] = useState<EnhancedFileEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderContents, setFolderContents] = useState<Record<string, EnhancedFileEntry[]>>({});

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const tree = await listFilesWithMetadata('/');
        const sortedTree = sortFileEntries(tree);
        setEntries(sortedTree);
      } catch (e: any) {
        setError(e.message || 'Failed to load files');
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [project]);

  // Load folder contents when a folder is expanded
  const loadFolderContents = async (folderPath: string) => {
    if (folderContents[folderPath]) return; // Already loaded
    
    try {
      const contents = await listFilesWithMetadata(folderPath);
      const sortedContents = sortFileEntries(contents);
      setFolderContents(prev => ({
        ...prev,
        [folderPath]: sortedContents
      }));
    } catch (error) {
      console.error(`Failed to load folder contents for ${folderPath}:`, error);
    }
  };

  // Toggle folder expansion
  const toggleFolder = async (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
      // Load contents when expanding
      await loadFolderContents(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  // Filter entries based on search query
  const filteredEntries = filterFiles(entries, searchQuery);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
        Loading files...
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-sm p-2">{error}</p>;
  }

  const renderEntry = (entry: EnhancedFileEntry, depth: number) => {
    const padding = depth * 1.25; // rem
    const isSelected = selectedPath === entry.path;
    const isExpanded = expandedFolders.has(entry.path);
    
    if (entry.type === 'folder') {
      const hasChildren = folderContents[entry.path] && folderContents[entry.path].length > 0;
      
      return (
        <div key={entry.path} className="select-none">
          <div 
            onClick={() => toggleFolder(entry.path)}
            style={{ paddingLeft: `${padding}rem` }} 
            className={`flex items-center py-1 px-2 rounded hover:bg-gray-100 transition-colors cursor-pointer ${
              entry.isHidden ? 'opacity-60' : ''
            }`}
          >
            <span className="mr-2 text-lg">{getFileIcon(entry.name, true)}</span>
            <span className={`font-medium ${getFileColor(entry.name, true)}`}>
              {entry.name}
            </span>
            {/* Expand/collapse indicator */}
            <span className="ml-auto text-xs text-gray-400 transition-transform duration-200">
              {isExpanded ? '▼' : '▶'}
            </span>
            {/* Show item count when collapsed */}
            {!isExpanded && folderContents[entry.path] && (
              <span className="ml-2 text-xs text-gray-400">
                ({folderContents[entry.path].length})
              </span>
            )}
            {entry.isHidden && (
              <span className="ml-2 text-xs text-gray-400">(hidden)</span>
            )}
          </div>
          {/* Render children if folder is expanded */}
          {isExpanded && hasChildren && (
            <div>
              {folderContents[entry.path].map(child => renderEntry(child, depth + 1))}
            </div>
          )}
          {/* Loading indicator when expanding */}
          {isExpanded && !hasChildren && (
            <div style={{ paddingLeft: `${(depth + 1) * 1.25}rem` }} className="py-1 px-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto"></div>
            </div>
          )}
        </div>
      );
    }
    
    // File entry
    return (
      <button
        key={entry.path}
        onClick={() => onSelect(entry.path)}
        style={{ paddingLeft: `${padding}rem` }}
        className={`block w-full text-left py-1 px-2 rounded hover:bg-orange-50 transition-colors ${
          isSelected 
            ? 'bg-orange-100 text-orange-800 border-l-2 border-orange-500' 
            : 'text-gray-700 hover:border-l-2 hover:border-orange-200'
        } ${entry.isHidden ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <span className="mr-2 text-lg">{getFileIcon(entry.name, false)}</span>
            <span className={`truncate ${getFileColor(entry.name, false)}`}>
              {entry.name}
            </span>
            {entry.isHidden && (
              <span className="ml-2 text-xs text-gray-400">(hidden)</span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 ml-2">
            {entry.sizeFormatted && entry.sizeFormatted !== '--' && (
              <span className="whitespace-nowrap">{entry.sizeFormatted}</span>
            )}
            {entry.lastModified && (
              <span className="whitespace-nowrap">
                {entry.lastModified.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* File tree */}
      <div className="flex-1 overflow-auto text-sm py-2">
        {filteredEntries.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No files found matching your search.' : 'No files found.'}
          </div>
        ) : (
          filteredEntries.map(e => renderEntry(e, 0))
        )}
      </div>
      
      {/* Status bar */}
      <div className="p-2 border-t border-gray-200 text-xs text-gray-500 bg-gray-50">
        {searchQuery ? (
          <span>{filteredEntries.length} of {entries.length} files</span>
        ) : (
          <span>{entries.length} items</span>
        )}
      </div>
    </div>
  );
}
