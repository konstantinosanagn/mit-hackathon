'use client';

interface ChatResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function ChatResizeHandle({ onMouseDown }: ChatResizeHandleProps) {
  return (
    <div
      className="absolute -right-1 top-0 bottom-0 w-2 bg-gray-300 opacity-0 group-hover:opacity-100 hover:opacity-100 cursor-col-resize transition-opacity z-10 select-none user-select-none"
      onMouseDown={onMouseDown}
    />
  );
}
