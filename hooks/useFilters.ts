import { useState, useCallback } from 'react';

export interface FilterState {
  models: string[];
  techStack: string[];
  tasks: string[];
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>({
    models: [],
    techStack: [],
    tasks: []
  });

  const updateFilters = useCallback((category: keyof FilterState, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [category]: values
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      models: [],
      techStack: [],
      tasks: []
    });
  }, []);

  const hasActiveFilters = filters.models.length > 0 || filters.techStack.length > 0 || filters.tasks.length > 0;

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters
  };
}
