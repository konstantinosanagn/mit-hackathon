import { FilterState } from '@/hooks/useFilters';

export interface Leader {
  project_name: string;
  likes: number;
  description: string;
  username: string;
  models: string[];
  tech_stack: string[];
  tasks: string[];
}

export function filterLeaders(leaders: Leader[], filters: FilterState): Leader[] {
  if (!filters.models.length && !filters.techStack.length && !filters.tasks.length) {
    return leaders; // No filters applied, return all
  }

  return leaders.filter(leader => {
    // Check if any of the selected models match
    const modelMatch = filters.models.length === 0 || 
      filters.models.some(filterModel => 
        leader.models.some(leaderModel => 
          leaderModel.toLowerCase().includes(filterModel.toLowerCase())
        )
      );

    // Check if any of the selected tech stack matches
    const techStackMatch = filters.techStack.length === 0 || 
      filters.techStack.some(filterTech => 
        leader.tech_stack.some(leaderTech => 
          leaderTech.toLowerCase().includes(filterTech.toLowerCase())
        )
      );

    // Check if any of the selected tasks match
    const taskMatch = filters.tasks.length === 0 || 
      filters.tasks.some(filterTask => 
        leader.tasks.some(leaderTask => 
          leaderTask.toLowerCase().includes(filterTask.toLowerCase())
        )
      );

    // All filters must match (AND logic)
    return modelMatch && techStackMatch && taskMatch;
  });
}

export function getFilteredCount(leaders: Leader[], filters: FilterState): number {
  return filterLeaders(leaders, filters).length;
}
