"use client";

import { useState, useRef, useEffect } from 'react';
import { deleteFile, downloadFile, renameFile } from '@/lib/filesApi';
import { getFileIcon, getFileColor } from '@/lib/file-utils';

interface FileContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  file: {
    name: string;
    path: string;
    type: 'file' | 'folder';
  };
  onClose: () => void;
  onRename: (oldPath: string, newName: string) => void;
  onDelete: (path: string) => void;
}

export default function FileContextMenu({ 
  isOpen, 
  x, 
  y, 
  file, 
  onClose, 
  onRename, 
  onDelete 
}: FileContextMenuProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewName(file.name);
    }
  }, [isOpen, file.name]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleRename = async () => {
    if (newName.trim() && newName !== file.name) {
      try {
        const oldPath = file.path;
        const newPath = file.path.replace(file.name, newName.trim());
        
        await renameFile(oldPath, newPath);
        onRename(oldPath, newName.trim());
        setIsRenaming(false);
        onClose();
      } catch (error: any) {
        console.error('Failed to rename file:', error);
        alert(`Failed to rename file: ${error.message}`);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await deleteFile(file.path);
        onDelete(file.path);
        onClose();
      } catch (error: any) {
        console.error('Failed to delete file:', error);
        alert(`Failed to delete file: ${error.message}`);
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await downloadFile(file.path);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(`Download failed: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to download file:', error);
      alert(`Failed to download file: ${error.message}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(file.name);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
      style={{ left: x, top: y }}
    >
      {/* File info header */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getFileIcon(file.name, file.type === 'folder')}</span>
          <span className={`font-medium ${getFileColor(file.name, file.type === 'folder')}`}>
            {file.name}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {file.type === 'folder' ? 'Folder' : 'File'}
        </p>
      </div>

      {/* Context menu items */}
      <div className="py-1">
        {isRenaming ? (
          <div className="px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleRename}
                className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsRenaming(false);
                  setNewName(file.name);
                }}
                className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsRenaming(true)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <span>✏️</span>
              <span>Rename</span>
            </button>
            
            {file.type === 'file' && (
              <button
                onClick={handleDownload}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <span>⬇️</span>
                <span>Download</span>
              </button>
            )}
            
            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
