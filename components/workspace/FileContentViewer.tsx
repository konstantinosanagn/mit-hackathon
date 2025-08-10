"use client";

import { useEffect, useState, useCallback } from 'react';
import { readTextFile, getFileMetadata, saveFile } from '@/lib/filesApi';
import { getFileIcon, getFileColor, isEditableFile, isPreviewableFile, getFileExtension } from '@/lib/file-utils';

interface FileContentViewerProps {
  filePath?: string;
  project?: string;
}

export default function FileContentViewer({ filePath, project }: FileContentViewerProps) {
  const [content, setContent] = useState('');
  const [editorValue, setEditorValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

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
          setEditorValue(text);
          setIsDirty(false);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to read file');
      } finally {
        setLoading(false);
      }
    };
    
    loadFile();
  }, [filePath]);

  const handleSave = useCallback(async () => {
    if (!filePath || !isEditableFile(filePath) || !isDirty) return;
    try {
      setSaving(true);
      await saveFile(filePath, editorValue);
      setContent(editorValue);
      setIsDirty(false);
    } catch (e: any) {
      setError(e.message || 'Failed to save file');
    } finally {
      setSaving(false);
    }
  }, [filePath, editorValue, isDirty]);

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
      {/* File header minimal */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getFileIcon(fileName, false)}</span>
          <h3 className={`font-medium ${getFileColor(fileName, false)} truncate`}>{fileName}</h3>
          {isEditable && (
            <span className={`ml-2 inline-block w-2 h-2 rounded-full ${isDirty ? 'bg-black' : 'bg-transparent border border-gray-300'}`} title={isDirty ? 'Unsaved changes' : 'Saved'} />
          )}
          {isEditable && (
            <button
              onClick={handleSave}
              className="ml-auto text-xs px-2 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
              disabled={!isDirty || saving}
              title="Save (Ctrl+S)"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* File content */}
      <div className="flex-1 overflow-auto">
        {isEditable ? (
          <div className="p-4 h-full">
            <textarea
              value={editorValue}
              onChange={(e) => { setEditorValue(e.target.value); setIsDirty(e.target.value !== content); }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className="w-full h-[calc(100vh-240px)] font-mono text-sm bg-white border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              spellCheck={false}
            />
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
