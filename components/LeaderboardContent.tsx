'use client';

import React, { useState, useEffect } from 'react';
import LeaderboardRow from './LeaderboardRow';

interface Leader {
  project_name: string;
  likes: number;
  description: string;
  username: string;
  tech_stack: string[];
}

interface LeaderboardContentProps {
  className?: string;
}

export default function LeaderboardContent({ className = '' }: LeaderboardContentProps) {
  const [leadersData, setLeadersData] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await fetch('/leaders.json');
        const data = await response.json();
        // Sort by likes from highest to lowest
        const sortedData = data.sort((a: Leader, b: Leader) => b.likes - a.likes);
        setLeadersData(sortedData);
      } catch (error) {
        console.error('Error fetching leaders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  const handleLeaderClick = (projectName: string) => {
    // Handle leader click - could open project details or profile
    console.log(`Clicked on ${projectName}`);
  };

  if (loading) {
    return (
      <div id="leaderboard-content" className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading leaders...</div>
      </div>
    );
  }

  return (
    <div id="leaderboard-content" className={`flex-1 overflow-y-auto scrollbar-hide h-full ${className}`}>
      <div className="space-y-0 h-full">
        {leadersData.map((leader, index) => (
          <LeaderboardRow 
            key={index}
            onClick={() => handleLeaderClick(leader.project_name)}
          >
                         <div className="flex items-center justify-between">
               <div className="flex flex-col">
                 <span className="text-xs font-medium text-black">{leader.project_name}</span>
                 <span className="text-xs text-blue-600">@{leader.username}</span>
               </div>
               <span className="text-xs text-gray-500">❤️ {leader.likes}</span>
             </div>
          </LeaderboardRow>
        ))}
      </div>
    </div>
  );
}
