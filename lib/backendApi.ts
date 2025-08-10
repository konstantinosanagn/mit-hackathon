import { backendFetch } from './backend';

export async function listProjects(): Promise<string[]> {
  const res = await backendFetch('/api/projects');
  if (!res.ok) throw new Error(`Failed to list projects (${res.status})`);
  const data = await res.json();

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.projects)) return data.projects;
  if (Array.isArray(data.workspaces)) return data.workspaces;
  if (Array.isArray(data.directories)) return data.directories;

  // Fallback: return keys if object of { name: something }
  if (data && typeof data === 'object') {
    return Object.values(data).filter(v => typeof v === 'string') as string[];
  }
  return [];
}

export async function createProject(name: string): Promise<void> {
  const res = await backendFetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to create project (${res.status})`);
}

export async function initSandbox(project: string): Promise<void> {
  const res = await backendFetch('/api/sandbox/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project }),
  });
  if (!res.ok) throw new Error(`Sandbox init failed (${res.status})`);
}

export async function startSandbox(project: string): Promise<{ url: string }> {
  const res = await backendFetch('/api/sandbox/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project }),
  });
  if (!res.ok) throw new Error(`Sandbox start failed (${res.status})`);
  return res.json();
}
