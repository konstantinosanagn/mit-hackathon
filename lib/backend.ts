export const BACKEND_BASE_URL: string =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : 'http://localhost:8000';

/**
 * Turn a relative API path (e.g. "/api/projects") into a full URL using the
 * configured `NEXT_PUBLIC_BACKEND_URL` – defaults to `http://localhost:8000`.
 *
 * If the caller passes an absolute URL (http/https), it is returned unchanged
 * so code can opt-in to external endpoints as well.
 */
export function buildApiUrl(path: string): string {
  // Already absolute → leave untouched
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Ensure there is exactly one leading slash after the base URL
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_BASE_URL}${normalisedPath}`;
}

/**
 * Thin wrapper around the global fetch that automatically prefixes relative
 * paths with the backend base URL.
 */
export function backendFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  if (typeof input === 'string') {
    return fetch(buildApiUrl(input), init);
  }
  // If input is a Request object or URL instance we assume caller already
  // provided a full URL.
  return fetch(input, init);
}
