import React from 'react';
import { SandboxStatus } from '@/types/app';

interface StatusBarProps {
  status: SandboxStatus;
  onRefreshStatus?: () => void;
}

export default function StatusBar({ status, onRefreshStatus }: StatusBarProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Debug logging to see if status is being updated
  React.useEffect(() => {
    console.log('[StatusBar] Status updated:', status);
  }, [status]);

  // Handle refresh with visual feedback
  const handleRefresh = async () => {
    if (onRefreshStatus && !isRefreshing) {
      setIsRefreshing(true);
      try {
        console.log('[StatusBar] Refreshing status...');
        await onRefreshStatus();
      } finally {
        // Reset after a short delay to show the refresh happened
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }
  };

  // Get status indicator color and animation based on status type
  const getStatusIndicator = () => {
    const baseClasses = 'w-2 h-2 rounded-full';

    switch (status.type) {
      case 'active':
        return {
          color: 'bg-green-400',
          icon: '●',
          className: `${baseClasses} bg-green-400 animate-pulse`,
        };
      case 'creating':
      case 'starting':
      case 'checking':
        return {
          color: 'bg-yellow-400',
          icon: '⟳',
          className: `${baseClasses} bg-yellow-400 animate-spin`,
        };
      case 'unhealthy':
        return {
          color: 'bg-orange-400',
          icon: '⚠',
          className: `${baseClasses} bg-orange-400`,
        };
      case 'timeout':
      case 'network-error':
        return {
          color: 'bg-red-400',
          icon: '✕',
          className: `${baseClasses} bg-red-400`,
        };
      case 'error':
        return {
          color: 'bg-red-500',
          icon: '✕',
          className: `${baseClasses} bg-red-500`,
        };
      default:
        return {
          color: 'bg-gray-400',
          icon: '○',
          className: `${baseClasses} bg-gray-400`,
        };
    }
  };

  const statusIndicator = getStatusIndicator();

  return (
    <div className="backdrop-blur-sm bg-white/20 rounded-xl border border-white/30 shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className={statusIndicator.className}></div>
          <span className="text-[#3d556e] font-semibold text-sm">
            {status.text}
          </span>
          {status.lastCheck && (
            <span className="text-gray-500 text-xs opacity-70">
              {Math.round((Date.now() - status.lastCheck) / 1000)}s ago
            </span>
          )}
        </div>

        {onRefreshStatus && (
          <button
            onClick={handleRefresh}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
              isRefreshing
                ? 'bg-blue-500 text-white scale-110 shadow-lg'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-gray-800 hover:scale-105 shadow-md'
            } ${
              status.type === 'checking' || isRefreshing
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
            title="Refresh status"
            disabled={status.type === 'checking' || isRefreshing}
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
