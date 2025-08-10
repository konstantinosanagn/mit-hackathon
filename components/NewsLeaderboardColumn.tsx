'use client';

import React from 'react';
import NewsLeaderboardCard from './NewsLeaderboardCard';
import styles from './NewsLeaderboardColumn.module.css';

interface NewsLeaderboardColumnProps {
  className?: string;
}

export default function NewsLeaderboardColumn({ className = '' }: NewsLeaderboardColumnProps) {
  return (
    <div 
      id="news-leaderboard-column" 
      className={`w-1/4 h-full ${styles.newsLeaderboardColumn} ${className}`}
    >
      <NewsLeaderboardCard />
    </div>
  );
}
