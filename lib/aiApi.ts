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
