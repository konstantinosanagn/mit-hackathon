import { useState, useRef, useEffect } from 'react';

// Define more granular status types
type SandboxStatusType =
  | 'disconnected'
  | 'connecting'
  | 'checking'
  | 'creating'
  | 'starting'
  | 'active'
  | 'unhealthy'
  | 'error'
  | 'timeout'
  | 'network-error';

interface SandboxStatus {
  text: string;
  active: boolean;
  type: SandboxStatusType;
  lastCheck?: number;
}

export function useSandboxStatus() {
  const [status, setStatus] = useState<SandboxStatus>({
    text: 'Not connected',
    active: false,
    type: 'disconnected',
  });

  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  const updateStatus = (
    text: string,
    active: boolean,
    type: SandboxStatusType = 'disconnected'
  ) => {
    if (isMountedRef.current) {
      setStatus({
        text,
        active,
        type,
        lastCheck: Date.now(),
      });
    }
  };

  // Start periodic status checks when sandbox is active
  const startStatusChecks = () => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }

    statusCheckIntervalRef.current = setInterval(async () => {
      if (isMountedRef.current) {
        try {
          await checkSandboxStatus(true); // Silent check
        } catch (error) {
          console.debug('[periodic] Sandbox status check failed:', error);
        }
      } else {
        stopStatusChecks();
      }
    }, 30000); // Check every 30 seconds
  };

  // Stop periodic status checks
  const stopStatusChecks = () => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  };

  const checkSandboxStatus = async (silent: boolean = false) => {
    if (!isMountedRef.current) {
      return;
    }

    if (typeof window !== 'undefined' && !navigator.onLine) {
      if (!silent) {
        updateStatus('Offline', false, 'network-error');
      }
      return;
    }

    if (!silent) {
      updateStatus('Checking sandbox...', false, 'checking');
    }

    try {
      const response = await fetch('/api/sandbox-status', {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!isMountedRef.current) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.active && data.healthy && data.sandboxData) {
        updateStatus('Sandbox active', true, 'active');
        startStatusChecks(); // Start periodic checks
        return data.sandboxData;
      } else if (data.active && !data.healthy) {
        updateStatus('Sandbox unhealthy', false, 'unhealthy');
        stopStatusChecks();
        return data.sandboxData || null;
      } else {
        updateStatus('No sandbox', false, 'disconnected');
        stopStatusChecks();
        return null;
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to check sandbox status:', error);
      }

      if (!isMountedRef.current) {
        return;
      }

      if (error.name === 'AbortError') {
        if (!silent) {
          updateStatus('Status check timeout', false, 'timeout');
        }
      } else if (error.message && error.message.includes('Failed to fetch')) {
        if (!silent) {
          updateStatus('Network error', false, 'network-error');
        }
      } else {
        if (!silent) {
          updateStatus('Connection error', false, 'error');
        }
      }

      if (!silent) {
        stopStatusChecks();
      }
      return null;
    }
  };

  return {
    status,
    updateStatus,
    checkSandboxStatus,
    startStatusChecks,
    stopStatusChecks,
  };
}
