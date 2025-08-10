"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listProjects, initSandbox, startSandbox } from '@/lib/backendApi';

interface ProjectsListProps {
  onProjectOpened?: (name: string) => void;
}

export default function ProjectsList({ onProjectOpened }: ProjectsListProps) {
  const [projects, setProjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await listProjects();
        if (Array.isArray(result)) {
          // Keep only the latest two test projects and filter the rest
          // Definition: names matching /^test\d+/ or starting with 'test'
          const tests = result.filter(n => /^test\d+/i.test(n) || n.toLowerCase().startsWith('test'));
          const nonTests = result.filter(n => !(/^test\d+/i.test(n) || n.toLowerCase().startsWith('test')));

          // Sort test projects by natural numeric index descending
          const sortedTests = [...tests].sort((a, b) => {
            const na = parseInt(a.replace(/\D+/g, ''), 10) || 0;
            const nb = parseInt(b.replace(/\D+/g, ''), 10) || 0;
            return nb - na;
          });

          const visibleTests = sortedTests.slice(0, 2); // keep only latest two
          const finalList = [...nonTests, ...visibleTests];
          setProjects(finalList);
        } else {
          setProjects([]);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load projects');
      }
    };
    fetchProjects();
  }, []);

  const handleOpen = async (project: string) => {
    setLoading(true);
    router.push(`/workspace?project=${encodeURIComponent(project)}`);

    // fire-and-forget: ensure sandbox running in background
    try {
      await initSandbox(project);
      await startSandbox(project);
      onProjectOpened?.(project);
    } catch (err) {
      // Let workspace handle status; we silently ignore for now
      console.warn('Failed to init/start sandbox', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (project: string) => {
    // Optional: if backend provides delete endpoint.
    // For now we simply hide in UI (already filtered). Hook for future integration.
    setProjects(prev => prev.filter(p => p !== project));
  };

  if (error) {
    return <p className="text-red-600 text-sm mt-2">{error}</p>;
  }

  if (projects.length === 0) {
    return <p className="text-gray-500 text-sm mt-2">No projects yet.</p>;
  }

  return (
    <ul className="space-y-2 mt-4">
      {projects.map(name => (
        <li key={name}>
          <button
            onClick={() => handleOpen(name)}
            disabled={loading}
            className="w-full text-left px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-60"
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  );
}
