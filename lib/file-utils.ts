// File utility functions for enhanced file management
// Inspired by Flask prototype features

export interface FileTypeInfo {
  type: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'code' | 'config' | 'default';
  icon: string;
  color: string;
  extensions: string[];
}

export interface EnhancedFileEntry {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: EnhancedFileEntry[];
  size?: number;
  sizeFormatted?: string;
  fileType?: FileTypeInfo;
  lastModified?: Date;
  isHidden?: boolean;
}

// File type definitions with icons and colors
export const FILE_TYPES: Record<string, FileTypeInfo> = {
  image: {
    type: 'image',
    icon: '🖼️',
    color: 'text-blue-600',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico']
  },
  document: {
    type: 'document',
    icon: '📄',
    color: 'text-green-600',
    extensions: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt']
  },
  video: {
    type: 'video',
    icon: '🎥',
    color: 'text-purple-600',
    extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
  },
  audio: {
    type: 'audio',
    icon: '🎵',
    color: 'text-pink-600',
    extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma']
  },
  archive: {
    type: 'archive',
    icon: '📦',
    color: 'text-orange-600',
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']
  },
  code: {
    type: 'code',
    icon: '💻',
    color: 'text-indigo-600',
    extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt']
  },
  config: {
    type: 'config',
    icon: '⚙️',
    color: 'text-gray-600',
    extensions: ['json', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env', 'xml']
  },
  default: {
    type: 'default',
    icon: '📄',
    color: 'text-gray-500',
    extensions: []
  }
};

// Detect file type based on extension
export function detectFileType(filename: string): FileTypeInfo {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return FILE_TYPES.default;

  for (const [key, fileType] of Object.entries(FILE_TYPES)) {
    if (fileType.extensions.includes(extension)) {
      return fileType;
    }
  }

  return FILE_TYPES.default;
}

// Format file size in human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Check if file is hidden (starts with .)
export function isHiddenFile(filename: string): boolean {
  return filename.startsWith('.');
}

// Get file icon based on type
export function getFileIcon(filename: string, isFolder: boolean = false): string {
  if (isFolder) return '📁';
  
  const fileType = detectFileType(filename);
  return fileType?.icon || '📄';
}

// Get file color class based on type
export function getFileColor(filename: string, isFolder: boolean = false): string {
  if (isFolder) return 'text-blue-600';
  
  const fileType = detectFileType(filename);
  return fileType?.color || 'text-gray-500';
}

// Sort files and folders (folders first, then files alphabetically)
export function sortFileEntries(entries: EnhancedFileEntry[]): EnhancedFileEntry[] {
  return entries.sort((a, b) => {
    // Folders first
    if (a.type === 'folder' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'folder') return 1;
    
    // Then alphabetically
    return a.name.localeCompare(b.name);
  });
}

// Filter files by search query
export function filterFiles(entries: EnhancedFileEntry[], query: string): EnhancedFileEntry[] {
  if (!query.trim()) return entries;
  
  const lowerQuery = query.toLowerCase();
  
  return entries.filter(entry => {
    if (entry.name.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in children recursively
    if (entry.children) {
      const filteredChildren = filterFiles(entry.children, query);
      if (filteredChildren.length > 0) {
        entry.children = filteredChildren;
        return true;
      }
    }
    
    return false;
  });
}

// Get file extension
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// Check if file is editable (text-based)
export function isEditableFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const editableExtensions = [
    'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs',
    'php', 'rb', 'go', 'rs', 'swift', 'kt', 'html', 'css', 'scss', 'sass',
    'json', 'yaml', 'yml', 'xml', 'sql', 'sh', 'bat', 'ps1', 'env'
  ];
  return editableExtensions.includes(extension);
}

// Check if file is previewable
export function isPreviewableFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const previewableExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico',
    'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c',
    'html', 'css', 'json', 'yaml', 'yml', 'xml'
  ];
  return previewableExtensions.includes(extension);
}
