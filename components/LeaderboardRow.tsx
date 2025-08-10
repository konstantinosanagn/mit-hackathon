'use client';

import React from 'react';

interface LeaderboardRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function LeaderboardRow({ children, className = '', onClick }: LeaderboardRowProps) {
  return (
    <div 
      id="leaderboard-row"
      className={`p-3 border-t border-b border-gray-200 transition-colors duration-200 hover:bg-blue-50 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

