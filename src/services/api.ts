export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

export const AUTH_TOKEN_STORAGE_KEY = 'access_token';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type ApiOptions = RequestInit & { skipAuth?: boolean };

export async function apiRequest<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth = false, headers: suppliedHeaders, ...requestOptions } = options;
  const headers = new Headers(suppliedHeaders);
  const hasBody = requestOptions.body !== undefined && requestOptions.body !== null;
  if (hasBody && !(requestOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = skipAuth ? null : localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...requestOptions, headers });
  } catch {
    throw new ApiError('Unable to reach the API. Check that the backend is running.', 0);
  }

  const result = response.status === 204
    ? null
    : await response.json().catch(() => null);

  if (response.status === 401 && !path.startsWith('/auth/login') && !path.startsWith('/auth/bootstrap-admin')) {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.dispatchEvent(new Event('auth:expired'));
  }

  if (!response.ok) {
    const message = Array.isArray((result as { message?: unknown[] } | null)?.message)
      ? ((result as { message: unknown[] }).message).join(', ')
      : (result as { message?: string } | null)?.message
        || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }
  return result as T;
}
