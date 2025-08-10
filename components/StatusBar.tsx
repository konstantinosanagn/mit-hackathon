import React from 'react';
import { SandboxStatus } from '@/types/app';

interface StatusBarProps {
  status: SandboxStatus;
  onRefreshStatus?: () => void;
}

export default function StatusBar({ status, onRefreshStatus }: StatusBarProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Handle refresh with visual feedback
  const handleRefresh = async () => {
    if (onRefreshStatus && !isRefreshing) {
      setIsRefreshing(true);
      try {
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
    <div className="status-bar">
      <div className="status-bar-content">
        <div className="status-indicator">
          <div className={statusIndicator.className}></div>
          <span className="status-text">{status.text}</span>
          {status.lastCheck && (
            <span className="status-time">
              {Math.round((Date.now() - status.lastCheck) / 1000)}s ago
            </span>
          )}
        </div>

        {onRefreshStatus && (
          <button
            onClick={handleRefresh}
            className={`status-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
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

      <style jsx>{`
        .status-bar {
          backdrop-filter: blur(4px) saturate(145%);
          -webkit-backdrop-filter: blur(4px) saturate(145%);
          background-color: rgba(200, 200, 210, 0.2);
          border-radius: 12px;
          border: 1px solid #fff;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -2px rgba(0, 0, 0, 0.1);
          padding: 0;
          overflow: hidden;
          position: relative;
        }

        .status-bar-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          color: #2d2d2d;
          font-family: 'Funnel Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .status-text {
          color: #3d556e;
          font-weight: 600;
        }

        .status-time {
          color: #666;
          font-size: 12px;
          opacity: 0.7;
        }

        .status-refresh-btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          pointer-events: auto;
        }

        .status-refresh-btn:hover {
          background: rgba(255, 255, 255, 1);
          color: #333;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .status-refresh-btn:active {
          transform: scale(0.95);
        }

        .status-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .status-refresh-btn:focus {
          outline: none;
        }

        .status-refresh-btn.refreshing {
          background: rgba(59, 130, 246, 0.9);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .status-refresh-btn.refreshing:hover {
          background: rgba(59, 130, 246, 1);
          transform: scale(1.1);
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .status-bar-content {
            padding: 4px 8px;
            font-size: 12px;
          }

          .status-indicator {
            min-width: 100px;
            gap: 6px;
          }

          .status-refresh-btn {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 480px) {
          .status-bar-content {
            padding: 3px 6px;
            font-size: 11px;
          }

          .status-indicator {
            min-width: 80px;
            gap: 4px;
          }

          .status-refresh-btn {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  );
}
