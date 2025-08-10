'use client';

import React from 'react';
import LeaderboardTitle from './LeaderboardTitle';
import LeaderboardContent from './LeaderboardContent';

interface LeaderboardProps {
  className?: string;
}

export default function Leaderboard({ className = '' }: LeaderboardProps) {
  return (
    <div 
      id="leaderboard"
      className={`w-full bg-transparent h-full flex flex-col ${className}`}
    >
      <LeaderboardTitle className="mb-3" />
      <LeaderboardContent />
    </div>
  );
}
