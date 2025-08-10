// Application Configuration
// This file contains all configurable settings for the application

export const appConfig = {
  // E2B Sandbox Configuration
  e2b: {
    // Sandbox timeout in minutes
    timeoutMinutes: 15,

    // Convert to milliseconds for E2B API
    get timeoutMs() {
      return this.timeoutMinutes * 60 * 1000;
    },

    // Vite development server port
    vitePort: 5173,

    // Time to wait for Vite to be ready (in milliseconds)
    viteStartupDelay: 3000, // Reduced from 7000ms to 3000ms for faster startup

    // Time to wait for CSS rebuild (in milliseconds)
    cssRebuildDelay: 2000,

    // Default sandbox template (if using templates)
    defaultTemplate: undefined, // or specify a template ID
  },

  // AI Model Configuration
  ai: {
    // Default AI model
    defaultModel: 'moonshotai/kimi-k2-instruct',

    // Available models
    availableModels: [
      'openai/gpt-5',
      'moonshotai/kimi-k2-instruct',
      'anthropic/claude-sonnet-4-20250514',
    ],

    // Model display names
    modelDisplayNames: {
      'openai/gpt-5': 'GPT-5',
      'moonshotai/kimi-k2-instruct': 'Kimi K2 Instruct',
      'anthropic/claude-sonnet-4-20250514': 'Sonnet 4',
    },

    // Temperature settings for non-reasoning models
    defaultTemperature: 0.7,

    // Max tokens for code generation
    maxTokens: 8000,

    // Max tokens for truncation recovery
    truncationRecoveryMaxTokens: 4000,
  },

  // Code Application Configuration
  codeApplication: {
    // Delay after applying code before refreshing iframe (milliseconds)
    defaultRefreshDelay: 2000,

    // Delay when packages are installed (milliseconds)
    packageInstallRefreshDelay: 5000,

    // Enable/disable automatic truncation recovery
    enableTruncationRecovery: false, // Disabled - too many false positives

    // Maximum number of truncation recovery attempts per file
    maxTruncationRecoveryAttempts: 1,
  },

  // UI Configuration
  ui: {
    // Show/hide certain UI elements
    showModelSelector: true,
    showStatusIndicator: true,

    // Animation durations (milliseconds)
    animationDuration: 200,

    // Toast notification duration (milliseconds)
    toastDuration: 3000,

    // Maximum chat messages to keep in memory
    maxChatMessages: 100,

    // Maximum recent messages to send as context
    maxRecentMessagesContext: 20,
  },

  // Development Configuration
  dev: {
    // Enable debug logging
    enableDebugLogging: true,

    // Enable performance monitoring
    enablePerformanceMonitoring: true,

    // Log API responses
    logApiResponses: false, // Disabled for better performance

    // Enable React DevTools profiler
    enableProfiler: false,
  },

  // Performance Configuration
  performance: {
    // Debounce delay for search inputs (milliseconds)
    searchDebounceDelay: 300,

    // Throttle delay for scroll events (milliseconds)
    scrollThrottleDelay: 16, // ~60fps

    // Maximum number of chat messages to render
    maxRenderedMessages: 50,

    // Enable virtual scrolling for large lists
    enableVirtualScrolling: true,

    // Cache duration for API responses (milliseconds)
    apiCacheDuration: 5 * 60 * 1000, // 5 minutes

    // Enable service worker for caching
    enableServiceWorker: false,

    // Lazy load components
    lazyLoadComponents: true,

    // Enable code splitting
    enableCodeSplitting: true,
  },

  // Package Installation Configuration
  packages: {
    // Use --legacy-peer-deps flag for npm install
    useLegacyPeerDeps: true,

    // Package installation timeout (milliseconds)
    installTimeout: 60000,

    // Auto-restart Vite after package installation
    autoRestartVite: true,
  },

  // File Management Configuration
  files: {
    // Excluded file patterns (files to ignore)
    excludePatterns: [
      'node_modules/**',
      '.git/**',
      '.next/**',
      'dist/**',
      'build/**',
      '*.log',
      '.DS_Store',
    ],

    // Maximum file size to read (bytes)
    maxFileSize: 1024 * 1024, // 1MB

    // File extensions to treat as text
    textFileExtensions: [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.css',
      '.scss',
      '.sass',
      '.html',
      '.xml',
      '.svg',
      '.json',
      '.yml',
      '.yaml',
      '.md',
      '.txt',
      '.env',
      '.gitignore',
      '.dockerignore',
    ],
  },

  // API Endpoints Configuration (for external services)
  api: {
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000, // milliseconds

    // Request timeout (milliseconds)
    requestTimeout: 30000,
  },
};

// Type-safe config getter
export function getConfig<K extends keyof typeof appConfig>(
  key: K
): (typeof appConfig)[K] {
  return appConfig[key];
}

// Helper to get nested config values
export function getConfigValue(path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], appConfig as any);
}

export default appConfig;
