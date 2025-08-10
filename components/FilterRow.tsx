'use client';

import React from 'react';
import MinimalFilter from './MinimalFilter';
import MinimalDropdown from './MinimalDropdown';
import styles from './FilterRow.module.css';
import { useFilterContext } from './FilterProvider';

interface FilterRowProps {
  className?: string;
}

export default function FilterRow({ className = '' }: FilterRowProps) {
  const { filters, updateFilters, clearFilters, hasActiveFilters } = useFilterContext();

  const handleModelsSelect = (selectedModels: string[]) => {
    updateFilters('models', selectedModels);
  };

  const handleTechStackSelect = (selectedTechStack: string[]) => {
    updateFilters('techStack', selectedTechStack);
  };

  const handleTasksSelect = (selectedTasks: string[]) => {
    updateFilters('tasks', selectedTasks);
  };

  return (
    <div id="filter-row" className={`${styles['filter-row']} ${className}`}>
      <MinimalDropdown 
        label="Models" 
        options={['GPT-4', 'Claude 3', 'Gemini Pro', 'Llama 3', 'Mistral']}
        onSelect={handleModelsSelect}
        selectedOptions={filters.models}
        multiSelect={true}
        showIcons={true}
      />
      <MinimalDropdown 
        label="Tech Stack" 
        options={['Python', 'JavaScript', 'React', 'TensorFlow', 'PyTorch']}
        onSelect={handleTechStackSelect}
        selectedOptions={filters.techStack}
        multiSelect={true}
        showIcons={true}
      />
      <MinimalDropdown 
        label="Task" 
        options={['Image Generation', 'Text Generation', 'Fine-tuning', 'Chatbot', 'Data Analysis']}
        onSelect={handleTasksSelect}
        selectedOptions={filters.tasks}
        multiSelect={true}
        showIcons={true}
      />
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
