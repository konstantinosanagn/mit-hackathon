"use client";

import { useEffect, useState } from 'react';
import { readTextFile, getFileMetadata } from '@/lib/filesApi';
import { getFileIcon, getFileColor, isEditableFile, isPreviewableFile, getFileExtension } from '@/lib/file-utils';

interface FileContentViewerProps {
  filePath?: string;
  project?: string;
}

export default function FileContentViewer({ filePath, project }: FileContentViewerProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (!filePath) return;
    
    const loadFile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load file metadata
        const fileMetadata = await getFileMetadata(filePath);
        setMetadata(fileMetadata);
        
        // Load file content if it's a text file
        if (isEditableFile(filePath)) {
          const text = await readTextFile(filePath);
          setContent(text);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to read file');
      } finally {
        setLoading(false);
      }
    };
    
    loadFile();
  }, [filePath]);

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📁</div>
          <p>Select a file to view its contents</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <div className="text-4xl mb-2">❌</div>
          <p className="font-medium">Error loading file</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const fileName = filePath.split('/').pop() || '';
  const fileExtension = getFileExtension(fileName);
  const isEditable = isEditableFile(fileName);
  const isPreviewable = isPreviewableFile(fileName);

  return (
    <div className="h-full flex flex-col">
      {/* File header with properties */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">{getFileIcon(fileName, false)}</span>
          <div>
            <h3 className={`font-medium ${getFileColor(fileName, false)}`}>
              {fileName}
            </h3>
            <p className="text-sm text-gray-500">
              {filePath}
            </p>
          </div>
        </div>
        
        {/* File properties */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 font-medium">{fileExtension || 'Unknown'}</span>
          </div>
          {metadata?.size !== undefined && (
            <div>
              <span className="text-gray-500">Size:</span>
              <span className="ml-2 font-medium">
                {metadata.size >= 1024 
                  ? `${(metadata.size / 1024).toFixed(1)} KB` 
                  : `${metadata.size} B`
                }
              </span>
            </div>
          )}
          {metadata?.lastModified && (
            <div>
              <span className="text-gray-500">Modified:</span>
              <span className="ml-2 font-medium">
                {new Date(metadata.lastModified).toLocaleString()}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Editable:</span>
            <span className={`ml-2 font-medium ${isEditable ? 'text-green-600' : 'text-red-600'}`}>
              {isEditable ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* File content */}
      <div className="flex-1 overflow-auto">
        {isEditable ? (
          <div className="p-4">
            {fileExtension === 'md' ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border">
                  <code>{content}</code>
                </pre>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border h-full overflow-auto">
                <code className={`language-${fileExtension}`}>{content}</code>
              </pre>
            )}
          </div>
        ) : isPreviewable ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-4xl mb-2">👁️</div>
            <p>Preview not available for this file type</p>
            <p className="text-sm mt-1">File: {fileName}</p>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>This file type cannot be displayed</p>
            <p className="text-sm mt-1">File: {fileName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
