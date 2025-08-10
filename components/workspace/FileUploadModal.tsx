"use client";

import { useState, useRef, useCallback } from 'react';
import { uploadFile } from '@/lib/filesApi';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  currentPath?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FileUploadModal({ 
  isOpen, 
  onClose, 
  onUploadComplete, 
  currentPath = '/' 
}: FileUploadModalProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList) => {
    const newUploads: UploadProgress[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploads(prev => [...prev, ...newUploads]);
    
    // Start upload for each file
    newUploads.forEach(async (upload) => {
      try {
        await uploadFile(upload.file, currentPath);
        setUploads(prev => 
          prev.map(u => 
            u.file === upload.file 
              ? { ...u, progress: 100, status: 'completed' }
              : u
          )
        );
      } catch (error: any) {
        setUploads(prev => 
          prev.map(u => 
            u.file === upload.file 
              ? { ...u, status: 'error', error: error.message }
              : u
          )
        );
      }
    });
  }, [currentPath]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleClose = useCallback(() => {
    if (uploads.every(u => u.status === 'completed' || u.status === 'error')) {
      setUploads([]);
      onClose();
      onUploadComplete();
    }
  }, [uploads, onClose, onUploadComplete]);

  const removeUpload = useCallback((file: File) => {
    setUploads(prev => prev.filter(u => u.file !== file));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Upload to: {currentPath}
          </p>
        </div>

        {/* Upload Area */}
        <div className="px-6 py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-orange-400 bg-orange-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-600 mb-2">
              Drag and drop files here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Supports all file types
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Upload Progress */}
        {uploads.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Upload Progress</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {uploads.map((upload, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 truncate">
                        {upload.file.name}
                      </span>
                      <span className="text-gray-500">
                        {upload.status === 'uploading' && `${upload.progress}%`}
                        {upload.status === 'completed' && '✓'}
                        {upload.status === 'error' && '✗'}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    {upload.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Error message */}
                    {upload.status === 'error' && upload.error && (
                      <p className="text-sm text-red-600 mt-1">{upload.error}</p>
                    )}
                  </div>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeUpload(upload.file)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {uploads.length === 0 ? 'Cancel' : 'Close'}
            </button>
            {uploads.length > 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 transition-colors"
              >
                Add More Files
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
