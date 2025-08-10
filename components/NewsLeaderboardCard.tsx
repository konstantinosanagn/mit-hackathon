'use client';

import React from 'react';
import News from './News';
import Leaderboard from './Leaderboard';

interface NewsLeaderboardCardProps {
  className?: string;
}

export default function NewsLeaderboardCard({ className = '' }: NewsLeaderboardCardProps) {
  return (
          <div 
        id="news-leaderboard-card"
        className={`w-full h-full ${className}`}
        style={{
          height: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--color-blue-700)'
        }}
      >
                           <div className="w-full h-full flex flex-col gap-4 p-6">
        <div className="h-1/2">
          <News />
        </div>
        <div className="h-1/2">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
