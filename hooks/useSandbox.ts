import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SandboxData } from '@/types/app';

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

export function useSandbox() {
  const [sandboxData, setSandboxData] = useState<SandboxData | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SandboxStatus>({
    text: 'Not connected',
    active: false,
    type: 'disconnected',
  });
  const [structureContent, setStructureContent] = useState(
    'No sandbox created yet'
  );
  const [sandboxFiles, setSandboxFiles] = useState<Record<string, string>>({});
  const [fileStructure, setFileStructure] = useState<string>('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const isMountedRef = useRef(true);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCreatingSandboxRef = useRef(false); // Lock to prevent multiple creations
  const activeControllersRef = useRef<Set<AbortController>>(new Set());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clear all active controllers
      activeControllersRef.current.forEach(controller => {
        try {
          if (!controller.signal.aborted) {
            controller.abort();
          }
        } catch (error) {
          console.debug('[cleanup] Controller abort error:', error);
        }
      });
      activeControllersRef.current.clear();
      
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  // Global error handler for AbortError
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.name === 'AbortError') {
        // Prevent AbortError from appearing in console
        event.preventDefault();
        console.debug('[global] AbortError caught and handled:', event.reason);
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.name === 'AbortError') {
        // Prevent AbortError from appearing in console
        event.preventDefault();
        console.debug('[global] AbortError caught and handled:', event.error);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
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

  const log = (
    message: string,
    type: 'info' | 'error' | 'command' = 'info'
  ) => {
    // This will be handled by the chat system
    console.log(`[${type}] ${message}`);
  };

  // Helper function to create and track AbortController
  const createTrackedController = (): AbortController => {
    const controller = new AbortController();
    activeControllersRef.current.add(controller);
    return controller;
  };

  // Helper function to cleanup AbortController
  const cleanupController = (controller: AbortController) => {
    try {
      activeControllersRef.current.delete(controller);
      // Only abort if not already aborted
      if (!controller.signal.aborted) {
        try {
          controller.abort();
        } catch (abortError) {
          // Ignore abort errors - they're expected when controller is already aborted
          console.debug('[cleanup] Expected abort error:', abortError);
        }
      }
    } catch (error) {
      console.debug('[cleanup] Controller cleanup error:', error);
    }
  };

  // Start periodic status checks when sandbox is active
  const startStatusChecks = () => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }

    statusCheckIntervalRef.current = setInterval(async () => {
      if (isMountedRef.current && sandboxData) {
        try {
          await checkSandboxStatus(true); // Silent check
        } catch (error) {
          // Silently handle errors in periodic checks
          console.debug('[periodic] Sandbox status check failed:', error);
        }
      } else {
        // Stop checks if component is unmounted or no sandbox data
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
    // Don't make requests if component is unmounted
    if (!isMountedRef.current) {
      return;
    }

    // Check if we're online before making the request
    if (typeof window !== 'undefined' && !navigator.onLine) {
      if (!silent) {
        updateStatus('Offline', false, 'network-error');
      }
      return;
    }

    if (!silent) {
      updateStatus('Checking sandbox...', false, 'checking');
    }

    const controller = createTrackedController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Set up timeout with better error handling
      timeoutId = setTimeout(() => {
        // Only abort if not already aborted
        if (!controller.signal.aborted) {
          try {
            controller.abort();
          } catch (error) {
            // Ignore abort errors - they're expected when controller is already aborted
            console.debug('[timeout] Expected abort error:', error);
          }
        }
      }, 10000); // 10 second timeout

      const response = await fetch('/api/sandbox-status', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.active && data.healthy && data.sandboxData) {
        setSandboxData(data.sandboxData);
        updateStatus('Sandbox active', true, 'active');
        startStatusChecks(); // Start periodic checks
      } else if (data.active && !data.healthy) {
        setSandboxData(data.sandboxData || null);
        updateStatus('Sandbox unhealthy', false, 'unhealthy');
        stopStatusChecks();
      } else {
        setSandboxData(null);
        updateStatus('No sandbox', false, 'disconnected');
        stopStatusChecks();
      }
    } catch (error: any) {
      // Only log errors that aren't abort errors to reduce noise
      if (error.name !== 'AbortError') {
        console.error('Failed to check sandbox status:', error);
      }

      // Only update status if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      // Handle different types of errors
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
          setSandboxData(null);
          updateStatus('Connection error', false, 'error');
        }
      }

      if (!silent) {
        stopStatusChecks();
      }
    } finally {
      // Cleanup
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      cleanupController(controller);
    }
  };

  const createSandbox = async (fromHomeScreen = false) => {
    // Prevent multiple simultaneous sandbox creations
    if (isCreatingSandboxRef.current) {
      console.log(
        '[createSandbox] Sandbox creation already in progress, skipping...'
      );
      return;
    }

    console.log('[createSandbox] Starting sandbox creation...');
    isCreatingSandboxRef.current = true;

    try {
      // Check if sandbox already exists and is healthy
      try {
        updateStatus('Checking existing sandbox...', false, 'checking');
        const statusResponse = await fetch('/api/sandbox-status', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });
        const statusData = await statusResponse.json();

        if (statusData.active && statusData.healthy && statusData.sandboxData) {
          console.log(
            '[createSandbox] Sandbox already exists and is healthy, using existing sandbox'
          );
          setSandboxData(statusData.sandboxData);
          updateStatus('Sandbox active', true, 'active');
          startStatusChecks(); // Start periodic checks
          return statusData.sandboxData;
        }
      } catch (error) {
        console.log(
          '[createSandbox] Could not check sandbox status, proceeding with creation'
        );
      }

      setLoading(true);
      updateStatus('Creating sandbox...', false, 'creating');

      const controller = createTrackedController();
      let timeoutId: NodeJS.Timeout | null = null;

      try {
        timeoutId = setTimeout(() => {
          // Only abort if not already aborted
          if (!controller.signal.aborted) {
            try {
              controller.abort();
            } catch (error) {
              // Ignore abort errors - they're expected when controller is already aborted
              console.debug('[createSandbox] Expected abort error:', error);
            }
          }
        }, 30000); // 30 second timeout for sandbox creation

        const response = await fetch('/api/create-ai-sandbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          signal: controller.signal,
        });

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) {
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[createSandbox] Response data:', data);

        if (data.success) {
          setSandboxData(data);
          updateStatus('Starting sandbox...', false, 'starting');

          // Wait a moment for sandbox to fully start
          setTimeout(() => {
            if (isMountedRef.current) {
              updateStatus('Sandbox active', true, 'active');
              startStatusChecks(); // Start periodic checks
            }
          }, 2000);

          log('Sandbox created successfully!');
          log(`Sandbox ID: ${data.sandboxId}`);
          log(`URL: ${data.url}`);

          // Update URL with sandbox ID (only if not in workspace)
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.includes('/workspace')
          ) {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set('sandbox', data.sandboxId);
            router.push(`/?${newParams.toString()}`, { scroll: false });
          }

          if (data.structure) {
            displayStructure(data.structure);
          }

          // Fetch sandbox files after creation
          setTimeout(fetchSandboxFiles, 1000);

          return data;
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (error: any) {
        console.error('[createSandbox] Error:', error);

        // Only update status if component is still mounted
        if (!isMountedRef.current) {
          return;
        }

        // Handle different types of errors
        if (error.name === 'AbortError') {
          updateStatus('Creation timeout', false, 'timeout');
          log('Sandbox creation timed out. Please try again.', 'error');
        } else if (error.message && error.message.includes('Failed to fetch')) {
          updateStatus('Network error', false, 'network-error');
          log(
            'Network error - please check your connection and try again.',
            'error'
          );
        } else {
          updateStatus('Creation failed', false, 'error');
          log(`Failed to create sandbox: ${error.message}`, 'error');
        }

        stopStatusChecks();
        throw error;
      } finally {
        setLoading(false);
        // Cleanup
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        cleanupController(controller);
      }
    } finally {
      // Always release the lock
      isCreatingSandboxRef.current = false;
    }
  };

  const displayStructure = (structure: any) => {
    if (typeof structure === 'object') {
      setStructureContent(JSON.stringify(structure, null, 2));
    } else {
      setStructureContent(structure || 'No structure available');
    }
  };

  const fetchSandboxFiles = async () => {
    if (!sandboxData || !isMountedRef.current) return;

    const controller = createTrackedController();

    try {
      const response = await fetch('/api/get-sandbox-files', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!isMountedRef.current) return;

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSandboxFiles(data.files || {});
          setFileStructure(data.structure || '');
          console.log(
            '[fetchSandboxFiles] Updated file list:',
            Object.keys(data.files || {}).length,
            'files'
          );
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('[fetchSandboxFiles] Error fetching files:', error);
      }
    } finally {
      cleanupController(controller);
    }
  };

  const restartViteServer = async () => {
    const controller = createTrackedController();

    try {
      const response = await fetch('/api/restart-vite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      if (!isMountedRef.current) return false;

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✓ Vite dev server restarted successfully!');
          return true;
        } else {
          throw new Error(data.error);
        }
      } else {
        throw new Error('Failed to restart Vite server');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('[restartViteServer] Error:', error);
      }
      throw error;
    } finally {
      cleanupController(controller);
    }
  };

  const downloadZip = async () => {
    if (!sandboxData) {
      throw new Error('No active sandbox to download. Create a sandbox first!');
    }

    setLoading(true);
    log('Creating zip file...');

    const controller = createTrackedController();

    try {
      const response = await fetch('/api/create-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      if (!isMountedRef.current) return;

      const data = await response.json();

      if (data.success) {
        log('Zip file created!');

        const link = document.createElement('a');
        link.href = data.dataUrl;
        link.download = data.fileName || 'e2b-project.zip';
        document.body.appendChild(link);
        link.click();
        
        // Safely remove the link element
        try {
          if (link && link.parentNode) {
            document.body.removeChild(link);
          }
        } catch (removeError) {
          console.debug('[downloadZip] Error removing link element:', removeError);
        }

        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        log(`Failed to create zip: ${error.message}`, 'error');
      }
      throw error;
    } finally {
      setLoading(false);
      cleanupController(controller);
    }
  };

  // Initialize sandbox on mount - only check status, don't auto-create
  useEffect(() => {
    let isInitializing = true;
    let isCleanedUp = false;

    const initializePage = async () => {
      if (!isMountedRef.current || isCleanedUp) return;

      // Clear old conversation
      try {
        const controller = createTrackedController();
        const timeoutId = setTimeout(() => {
          if (!controller.signal.aborted) {
            controller.abort();
          }
        }, 5000);

        await fetch('/api/conversation-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear-old' }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        cleanupController(controller);
        console.log('[home] Cleared old conversation data on mount');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error(
            '[ai-sandbox] Failed to clear old conversation:',
            error
          );
        }
      }

      // Only check sandbox status if still mounted and initializing
      if (isMountedRef.current && isInitializing && !isCleanedUp) {
        await checkSandboxStatus();
      }
    };

    initializePage();

    // Debounced focus handler to prevent excessive API calls
    let focusTimeout: NodeJS.Timeout;
    const handleFocus = () => {
      // Don't handle focus if component is unmounted or cleaned up
      if (!isMountedRef.current || isCleanedUp) {
        return;
      }

      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(async () => {
        // Double-check that component is still mounted before making the request
        if (isMountedRef.current && !isCleanedUp) {
          try {
            await checkSandboxStatus(true); // Silent check to avoid UI updates
          } catch (error) {
            // Silently handle errors in focus handler to prevent console spam
            console.debug('[focus] Sandbox status check failed:', error);
          }
        }
      }, 1000); // Wait 1 second after focus before checking
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isInitializing = false;
      isCleanedUp = true;
      window.removeEventListener('focus', handleFocus);
      clearTimeout(focusTimeout);
    };
  }, []); // Run only on mount

  return {
    sandboxData,
    loading,
    status,
    structureContent,
    sandboxFiles,
    fileStructure,
    updateStatus,
    log,
    checkSandboxStatus,
    createSandbox,
    displayStructure,
    fetchSandboxFiles,
    restartViteServer,
    downloadZip,
  };
}
