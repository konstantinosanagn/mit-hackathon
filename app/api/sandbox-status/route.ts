import { NextResponse } from 'next/server';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
  var existingFiles: Set<string>;
}

export async function GET() {
  try {
    // Check if sandbox exists
    const sandboxExists = !!global.activeSandbox;

    let sandboxHealthy = false;
    let sandboxInfo = null;

    if (sandboxExists && global.activeSandbox && global.sandboxData) {
      try {
        // Perform a more thorough health check
        const healthCheck = await performHealthCheck(global.sandboxData.url);
        sandboxHealthy = healthCheck.healthy;
        sandboxInfo = {
          sandboxId: global.sandboxData?.sandboxId,
          url: global.sandboxData?.url,
          filesTracked: global.existingFiles
            ? Array.from(global.existingFiles)
            : [],
          lastHealthCheck: new Date().toISOString(),
          healthDetails: healthCheck.details,
        };
      } catch (error) {
        console.error('[sandbox-status] Health check failed:', error);
        sandboxHealthy = false;
      }
    }

    return NextResponse.json({
      success: true,
      active: sandboxExists,
      healthy: sandboxHealthy,
      sandboxData: sandboxInfo,
      message: sandboxHealthy
        ? 'Sandbox is active and healthy'
        : sandboxExists
          ? 'Sandbox exists but is not responding'
          : 'No active sandbox',
    });
  } catch (error) {
    console.error('[sandbox-status] Error:', error);
    return NextResponse.json(
      {
        success: false,
        active: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

async function performHealthCheck(
  sandboxUrl: string
): Promise<{ healthy: boolean; details: any }> {
  try {
    // Quick health check - try to fetch the sandbox URL
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(`${sandboxUrl}`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          healthy: true,
          details: {
            statusCode: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
          },
        };
      } else {
        return {
          healthy: false,
          details: {
            statusCode: response.status,
            statusText: response.statusText,
            error: 'Sandbox responded but with error status',
          },
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    return {
      healthy: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown',
      },
    };
  }
}
