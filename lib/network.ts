import React from 'react';

// Network utilities for better error handling and connectivity monitoring

export interface NetworkStatus {
  isOnline: boolean;
  lastCheck: number;
  retryCount: number;
  maxRetries: number;
}

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private status: NetworkStatus = {
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    lastCheck: Date.now(),
    retryCount: 0,
    maxRetries: 3,
  };

  private listeners: ((status: NetworkStatus) => void)[] = [];

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  constructor() {
    // Only setup event listeners on the client side
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.status.retryCount = 0;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.status.lastCheck = Date.now();
    this.listeners.forEach(listener => listener(this.status));
  }

  addListener(listener: (status: NetworkStatus) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getStatus(): NetworkStatus {
    return { ...this.status };
  }

  async checkConnectivity(): Promise<boolean> {
    // Return true during SSR
    if (typeof window === 'undefined') {
      return true;
    }

    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          try {
            controller.abort();
          } catch (error) {
            console.debug('[network] Abort error:', error);
          }
        }
      }, 5000);

      const response = await fetch('/api/sandbox-status', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      const isOnline = response.ok;
      this.status.isOnline = isOnline;
      this.notifyListeners();

      return isOnline;
    } catch (error) {
      // Only update status if it's not an abort error
      if (error instanceof Error && error.name !== 'AbortError') {
        this.status.isOnline = false;
        this.notifyListeners();
      }
      return false;
    } finally {
      // Cleanup
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      try {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      } catch (cleanupError) {
        console.debug('[network] Cleanup error:', cleanupError);
      }
    }
  }
}

// Enhanced fetch wrapper with retry logic and better error handling
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Only set timeout on client side
      if (typeof window !== 'undefined') {
        timeoutId = setTimeout(() => {
          if (!controller.signal.aborted) {
            try {
              controller.abort();
            } catch (error) {
              console.debug('[fetchWithRetry] Abort error:', error);
            }
          }
        }, 30000);
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...options.headers,
        },
      });

      // Clear timeout if request completed successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error: any) {
      lastError = error;

      // Cleanup current attempt
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      try {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      } catch (cleanupError) {
        console.debug('[fetchWithRetry] Cleanup error:', cleanupError);
      }

      if (error.name === 'AbortError') {
        console.warn(
          `Request to ${url} timed out (attempt ${attempt + 1}/${maxRetries + 1})`
        );
      } else if (error.message && error.message.includes('Failed to fetch')) {
        console.warn(
          `Network error for ${url} (attempt ${attempt + 1}/${maxRetries + 1})`
        );
      } else {
        console.warn(
          `Request to ${url} failed: ${error.message} (attempt ${attempt + 1}/${maxRetries + 1})`
        );
      }

      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError!;
}

// API call wrapper with network monitoring
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retryConfig?: { maxRetries?: number; retryDelay?: number }
): Promise<T> {
  // Skip network monitoring during SSR
  if (typeof window !== 'undefined') {
    const networkMonitor = NetworkMonitor.getInstance();
    const status = networkMonitor.getStatus();

    if (!status.isOnline) {
      throw new Error(
        'No internet connection. Please check your network and try again.'
      );
    }
  }

  try {
    const response = await fetchWithRetry(
      endpoint,
      options,
      retryConfig?.maxRetries || 3,
      retryConfig?.retryDelay || 1000
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return data;
  } catch (error: any) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Network status hook for React components
export function useNetworkStatus() {
  const [status, setStatus] = React.useState<NetworkStatus>(() => {
    // Default to online during SSR
    if (typeof window === 'undefined') {
      return {
        isOnline: true,
        lastCheck: Date.now(),
        retryCount: 0,
        maxRetries: 3,
      };
    }

    const monitor = NetworkMonitor.getInstance();
    return monitor.getStatus();
  });

  React.useEffect(() => {
    // Only setup listener on client side
    if (typeof window === 'undefined') return;

    const monitor = NetworkMonitor.getInstance();
    const unsubscribe = monitor.addListener(setStatus);
    return unsubscribe;
  }, []);

  return status;
}

// Utility to show user-friendly error messages
export function getErrorMessage(error: any): string {
  if (error.name === 'AbortError') {
    return 'Request was cancelled or timed out. Please try again.';
  }

  if (error.message.includes('Failed to fetch')) {
    return 'Network error - please check your internet connection and try again.';
  }

  if (error.message.includes('HTTP 500')) {
    return 'Server error - please try again later.';
  }

  if (error.message.includes('HTTP 404')) {
    return 'Resource not found - please check the URL and try again.';
  }

  return error.message || 'An unexpected error occurred. Please try again.';
}

export { NetworkMonitor };
