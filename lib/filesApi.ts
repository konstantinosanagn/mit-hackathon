import { backendFetch } from './backend';
import { EnhancedFileEntry, detectFileType, formatFileSize, isHiddenFile } from './file-utils';

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileEntry[];
}

// Enhanced file entry with metadata
export interface FileMetadata {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: string;
  isHidden?: boolean;
}

export async function listFiles(directory = ''): Promise<EnhancedFileEntry[]> {
  const url = `/api/list?path=${encodeURIComponent(directory)}`;
  const response = await backendFetch(url);
  const data = await response.json();
  
  console.log('[/api/list] Response:', data);
  
  if (Array.isArray(data)) {
    // Simple array of filenames - convert to enhanced entries
    return data.map(name => {
      const isHidden = isHiddenFile(name);
      const fileType = detectFileType(name);
      return {
        name,
        path: `${directory}/${name}`,
        type: 'file',
        fileType,
        isHidden,
        size: 0, // Size not available in simple response
        sizeFormatted: 'Unknown'
      };
    });
  } else if (data && (Array.isArray(data.files) || Array.isArray(data.folders))) {
    const files = (data.files || []).map((f: any) => {
      const isHidden = isHiddenFile(f.name);
      const fileType = detectFileType(f.name);
      const size = f.size || 0;
      return {
        name: f.name,
        path: `${directory}/${f.name}`,
        type: f.type || 'file',
        fileType,
        size,
        sizeFormatted: formatFileSize(size),
        isHidden,
        lastModified: f.lastModified ? new Date(f.lastModified) : undefined
      };
    });
    
    const folders = (data.folders || []).map((f: any) => {
      const isHidden = isHiddenFile(f.name);
      return {
        name: f.name,
        path: `${directory}/${f.name}`,
        type: 'folder',
        fileType: { type: 'default', icon: '📁', color: 'text-blue-600', extensions: [] },
        isHidden,
        size: 0,
        sizeFormatted: '--',
        lastModified: f.lastModified ? new Date(f.lastModified) : undefined
      };
    });
    
    return [...folders, ...files];
  }
  return [];
}

// Get detailed file metadata
export async function getFileMetadata(path: string): Promise<FileMetadata | null> {
  try {
    const url = `/api/metadata?path=${encodeURIComponent(path)}`;
    const response = await backendFetch(url);
    
    if (!response.ok) {
      console.warn(`Failed to get metadata for ${path}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return {
      name: data.name || path.split('/').pop() || '',
      path: data.path || path,
      type: data.type || 'file',
      size: data.size,
      lastModified: data.lastModified,
      isHidden: data.isHidden || isHiddenFile(data.name || '')
    };
  } catch (error) {
    console.warn(`Error getting metadata for ${path}:`, error);
    return null;
  }
}

// Enhanced list files with metadata
export async function listFilesWithMetadata(directory = ''): Promise<EnhancedFileEntry[]> {
  const entries = await listFiles(directory);
  
  // Enhance entries with additional metadata if available
  const enhancedEntries = await Promise.all(
    entries.map(async (entry) => {
      if (entry.type === 'file' && !entry.size) {
        const metadata = await getFileMetadata(entry.path);
        if (metadata) {
          return {
            ...entry,
            size: metadata.size || 0,
            sizeFormatted: metadata.size ? formatFileSize(metadata.size) : 'Unknown',
            lastModified: metadata.lastModified ? new Date(metadata.lastModified) : undefined
          };
        }
      }
      return entry;
    })
  );
  
  return enhancedEntries;
}

export async function readTextFile(path: string): Promise<string> {
  const url = `/api/read?path=${encodeURIComponent(path)}`;
  const res = await backendFetch(url);
  if (!res.ok) throw new Error(`Failed to read file (${res.status})`);
  return res.text();
}

// Save text file
export async function saveFile(path: string, content: string): Promise<Response> {
  return backendFetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
}

// Upload file
export async function uploadFile(file: File, directory: string = '/'): Promise<Response> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', directory);
  
  return backendFetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
}

// Download file
export async function downloadFile(path: string): Promise<Response> {
  return backendFetch(`/api/download?path=${encodeURIComponent(path)}`);
}

// Delete file or directory
export async function deleteFile(path: string): Promise<Response> {
  return backendFetch('/api/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
}

// Create new file
export async function createFile(path: string, content: string = ''): Promise<Response> {
  return backendFetch('/api/create-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
}

// Rename file or directory
export async function renameFile(oldPath: string, newPath: string): Promise<Response> {
  return backendFetch('/api/rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPath, newPath }),
  });
}

// Create directory
export async function createDirectory(path: string): Promise<Response> {
  return backendFetch('/api/create-directory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
}
