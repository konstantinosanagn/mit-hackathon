'use client';

import React, { useState, useEffect, useRef } from 'react';
import NewsRow from './NewsRow';

interface NewsItem {
  date: string;
  news_text: string;
  link: string;
}

interface NewsContentProps {
  className?: string;
}

export default function NewsContent({ className = '' }: NewsContentProps) {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0.3);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/news.json');
        const data = await response.json();
        setNewsData(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

    useEffect(() => {
    if (!newsData.length || !containerRef.current) return;

    const animate = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      if (scrollHeight <= clientHeight) return; // No need to animate if content fits
      
      // Gradually adjust speed based on pause state
      setCurrentSpeed(prev => {
        const targetSpeed = isPaused ? 0 : 0.3;
        const acceleration = 0.02; // Adjust for faster/slower inertia
        
        if (isPaused && prev > 0) {
          return Math.max(0, prev - acceleration);
        } else if (!isPaused && prev < 0.3) {
          return Math.min(0.3, prev + acceleration);
        }
        return prev;
      });
      
      setScrollPosition(prev => {
        const newPosition = prev + currentSpeed;
        const maxScroll = scrollHeight - clientHeight;
        
        if (newPosition >= maxScroll) {
          // Reset to top when reaching bottom
          return 0;
        }
        
        return newPosition;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [newsData, isPaused, currentSpeed]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  const handleNewsClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (loading) {
    return (
      <div id="news-content" className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading news...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      id="news-content" 
      className={`flex-1 overflow-y-auto scrollbar-hide h-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="space-y-2 h-full">
        {newsData.map((item, index) => (
          <NewsRow 
            key={index}
            onClick={() => handleNewsClick(item.link)}
          >
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-gray-500">{item.date}</span>
              <span className="text-xs text-black">{item.news_text}</span>
            </div>
          </NewsRow>
        ))}
      </div>
    </div>
  );
}
