'use client';

import React from 'react';

interface LeaderboardTitleProps {
  className?: string;
}

export default function LeaderboardTitle({ className = '' }: LeaderboardTitleProps) {
  return (
    <div id="leaderboard-title" className={`flex items-center gap-2 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 48 48" 
        className="w-6 h-6 terminal-text"
      >
        <path 
          fill="currentColor" 
          d="M7 39h9.35V21H7v18Zm12.35 0h9.3V9h-9.3v30Zm12.3 0H41V25h-9.35v14ZM4 39V21c0 -0.825 0.29383 -1.5313 0.8815 -2.119C5.46883 18.2937 6.175 18 7 18h9.35V9c0 -0.825 0.2938 -1.53133 0.8815 -2.119C17.8188 6.29367 18.525 6 19.35 6h9.3c0.825 0 1.5313 0.29367 2.119 0.881 0.5873 0.58767 0.881 1.294 0.881 2.119v13H41c0.825 0 1.5313 0.2937 2.119 0.881 0.5873 0.5877 0.881 1.294 0.881 2.119v14c0 0.825 -0.2937 1.5312 -0.881 2.1185C42.5313 41.7062 41.825 42 41 42H7c-0.825 0 -1.53117 -0.2938 -2.1185 -0.8815C4.29383 40.5312 4 39.825 4 39Z" 
          strokeWidth="1"
        />
      </svg>
      <span className="terminal-text text-lg">leaderboard</span>
    </div>
  );
}
