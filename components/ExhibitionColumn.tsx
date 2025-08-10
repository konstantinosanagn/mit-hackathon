'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Project from './Project';
import { useFilterContext } from './FilterProvider';
import { filterLeaders, Leader } from '@/lib/filter-utils';



interface ExhibitionColumnProps {
  className?: string;
}

export default function ExhibitionColumn({ className = '' }: ExhibitionColumnProps) {
  const { filters } = useFilterContext();
  const [leadersData, setLeadersData] = useState<Leader[]>([]);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await fetch('/leaders.json');
        const data = await response.json();
        setLeadersData(data);
      } catch (error) {
        console.error('Error fetching leaders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  const handleProjectClick = (projectName: string) => {
    console.log(`Clicked on ${projectName}`);
  };

  const handleLikeClick = (projectName: string, currentLikes: number) => {
    setLikedProjects(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(projectName)) {
        newLiked.delete(projectName);
      } else {
        newLiked.add(projectName);
      }
      return newLiked;
    });
  };

  // Filter the data based on selected filters
  const filteredLeaders = useMemo(() => {
    return filterLeaders(leadersData, filters);
  }, [leadersData, filters]);

  if (loading) {
    return (
      <div id="exhibition-column" className={`w-3/4 h-full flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div id="exhibition-column" className={`w-3/4 h-full p-6 flex flex-col ${className}`}>
      {/* Subheader */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="terminal-text text-lg">exhibits</span>
          {(filters.models.length > 0 || filters.techStack.length > 0 || filters.tasks.length > 0) && (
            <>
              <span className="text-gray-400">:</span>
              <div className="flex flex-wrap gap-1">
                {filters.models.map((model, index) => (
                  <span key={`model-${index}`} className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {model}
                  </span>
                ))}
                {filters.techStack.map((tech, index) => (
                  <span key={`tech-${index}`} className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
                {filters.tasks.map((task, index) => (
                  <span key={`task-${index}`} className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {task}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        {filters.models.length > 0 || filters.techStack.length > 0 || filters.tasks.length > 0 ? (
          <span className="text-sm text-gray-600">
            {filteredLeaders.length} of {leadersData.length} results
          </span>
        ) : null}
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-3 grid-rows-2 gap-4 flex-1">
        {filteredLeaders.length === 0 ? (
          <div className="col-span-3 row-span-2 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-lg mb-2">No projects match your filters</div>
              <div className="text-sm">Try adjusting your selection</div>
            </div>
          </div>
        ) : (
          filteredLeaders.map((leader, index) => (
          <Project 
            key={index}
            onClick={() => handleProjectClick(leader.project_name)}
          >
                                                                                                       <div className="flex flex-col space-y-2 h-full">
                                   <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black truncate">{leader.project_name}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeClick(leader.project_name, leader.likes);
                      }}
                      className="text-xs text-gray-500 flex-shrink-0 hover:text-red-500 transition-colors"
                    >
                      {likedProjects.has(leader.project_name) ? '❤️' : '🤍'} {leader.likes + (likedProjects.has(leader.project_name) ? 1 : 0)}
                    </button>
                  </div>
                 <span className="text-xs text-gray-600 flex-1">{leader.description}</span>
                 
                                   {/* Models and Tech Stack */}
                  <div className="flex gap-1 flex-shrink-0 justify-end">
                    {leader.models.slice(0, 2).map((model, modelIndex) => (
                      <span key={modelIndex} className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                        {model}
                      </span>
                    ))}
                    {leader.models.length > 2 && (
                      <span className="text-xs text-gray-400">+{leader.models.length - 2}</span>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 justify-end">
                    {leader.tech_stack.slice(0, 2).map((tech, techIndex) => (
                      <span key={techIndex} className="text-xs bg-green-100 text-green-700 px-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {leader.tech_stack.length > 2 && (
                      <span className="text-xs text-gray-400">+{leader.tech_stack.length - 2}</span>
                    )}
                  </div>
                 
                                   {/* Bottom row: Username and Tasks */}
                  <div className="flex items-center justify-between min-w-0">
                    <span className="text-xs text-blue-600 truncate">@{leader.username}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      {leader.tasks.slice(0, 2).map((task, taskIndex) => (
                        <span key={taskIndex} className="text-xs bg-purple-100 text-purple-700 px-1 rounded">
                          {task}
                        </span>
                      ))}
                      {leader.tasks.length > 2 && (
                        <span className="text-xs text-gray-400">+{leader.tasks.length - 2}</span>
                      )}
                    </div>
                  </div>
               </div>
          </Project>
        ))
        )}
      </div>
    </div>
  );
}
