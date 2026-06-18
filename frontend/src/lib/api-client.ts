import { useAuthStore } from '@/store/auth-store';

/**
 * Central API client.
 *
 * The whole app is built against this thin wrapper. Today it runs in
 * MOCK_MODE (no backend required); when the FastAPI backend is ready, set
 * VITE_MOCK_MODE=false and every service automatically uses real HTTP.
 */

// Production default: talk to the real backend. Opt into the offline mock
// layer only for local UI work by setting VITE_MOCK_MODE=true.
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(
    `${BASE_URL}${path}`,
    window.location.origin,
  );
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, params } = options;
  const token = useAuthStore.getState().session?.accessToken;

  const res = await fetch(buildUrl(path, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.detail ?? data.message ?? message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Simulate network latency for mock services so loading states are real. */
export function mockDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
