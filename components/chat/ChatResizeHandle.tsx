'use client';

interface ChatResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing?: boolean;
}

export default function ChatResizeHandle({ onMouseDown, isResizing = false }: ChatResizeHandleProps) {
  return (
    <div
      className={`absolute -right-1 top-0 bottom-0 w-2 transition-all duration-200 z-10 select-none user-select-none ${
        isResizing 
          ? 'bg-gray-500 opacity-100 cursor-col-resize' 
          : 'bg-gray-300 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-gray-400 cursor-col-resize'
      }`}
      onMouseDown={onMouseDown}
      style={{ outline: 'none' }}
    />
  );
}
