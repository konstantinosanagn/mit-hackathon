'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useFilters, FilterState } from '@/hooks/useFilters';

interface FilterContextType {
  filters: FilterState;
  updateFilters: (category: keyof FilterState, values: string[]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const filterState = useFilters();

  return (
    <FilterContext.Provider value={filterState}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
}
