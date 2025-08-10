import { backendFetch } from './backend';

export interface AIGenerationRequest {
  prompt: string;
  model: string;
  context?: any;
  isEdit?: boolean;
}

export interface AIGenerationResponse {
  type: 'complete' | 'error';
  generatedCode?: string;
  explanation?: string;
  error?: string;
}

export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResponse {
  success: boolean;
  content?: string;
  screenshot?: string;
  error?: string;
}

export interface CodeApplicationRequest {
  response: string;
  isEdit: boolean;
  packages?: string[];
  sandboxId?: string;
}

export interface CodeApplicationResponse {
  type: 'start' | 'step' | 'package-progress' | 'complete' | 'error';
  message?: string;
  packages?: string[];
  filesCreated?: number;
  installedPackages?: string[];
  error?: string;
}

export interface AIChatRequest {
  project: string;
  model: 'kimi2' | 'gpt5' | 'claude';
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  session?: string; // Optional session id/name for per-workflow chat history
}

export interface AIChatResponse {
  assistant: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

// AI Code Generation
export async function generateAICode(request: AIGenerationRequest): Promise<Response> {
  return backendFetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

// Website Scraping
export async function scrapeWebsite(request: ScrapeRequest): Promise<Response> {
  return backendFetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

// Code Application
export async function applyCode(request: CodeApplicationRequest): Promise<Response> {
  return backendFetch('/api/ai/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

// AI Chat
export async function sendAIChat(request: AIChatRequest): Promise<Response> {
  return backendFetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

// Chat history & sessions
export interface ChatHistoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string | number;
}

export interface AvailableModel {
  label: string;
  provider: string;
  model_id: string;
}

export async function getAvailableModels(): Promise<AvailableModel[]> {
  const res = await backendFetch('/api/ai/models');
  if (!res.ok) throw new Error(`Failed to fetch models (${res.status})`);
  const data = await res.json();
  const models = Array.isArray(data) ? data : Array.isArray(data.models) ? data.models : [];
  return models as AvailableModel[];
}

export async function listChatSessions(): Promise<string[]> {
  const res = await backendFetch('/api/ai/history/sessions');
  if (!res.ok) throw new Error(`Failed to list chat sessions (${res.status})`);
  const data = await res.json();
  // Expect { sessions: string[] } or string[]
  return Array.isArray(data) ? data : Array.isArray(data.sessions) ? data.sessions : [];
}

export async function loadChatHistory(session: string, limit?: number): Promise<ChatHistoryMessage[]> {
  const url = `/api/ai/history?session=${encodeURIComponent(session)}${limit ? `&limit=${limit}` : ''}`;
  const res = await backendFetch(url);
  if (!res.ok) throw new Error(`Failed to load chat history (${res.status})`);
  const data = await res.json();
  // Expect { messages: [...] } or [...]
  return Array.isArray(data) ? data : Array.isArray(data.messages) ? data.messages : [];
}

export async function clearChatHistory(session: string): Promise<void> {
  const res = await backendFetch(`/api/ai/history/clear?session=${encodeURIComponent(session)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to clear chat history (${res.status})`);
}

export async function createChatSession(name: string): Promise<void> {
  const res = await backendFetch('/api/ai/history/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to create chat session (${res.status})`);
}

export async function deleteChatSession(name: string): Promise<void> {
  // Send exactly: DELETE /api/ai/history/sessions/{name}
  const url = `/api/ai/history/sessions/${name}`;
  console.debug('[aiApi] DELETE', url);
  const res = await backendFetch(url, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[aiApi] delete session failed', res.status, res.statusText, text);
    throw new Error(`Failed to delete chat session (${res.status}) ${text}`);
  }
  console.debug('[aiApi] Deleted session', name);
}
