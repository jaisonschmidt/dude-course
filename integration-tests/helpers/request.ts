/**
 * HTTP request helper for integration tests.
 *
 * Wraps fetch with a base URL and exposes the X-Request-Id returned
 * by the backend so tests can assert on it.
 */

const BASE_URL = process.env['BACKEND_URL'] ?? 'http://localhost:3001'

export interface TestResponse<T = unknown> {
  status: number
  body: T
  requestId: string | null
  headers: Headers
}

export async function get<T = unknown>(
  path: string,
  headers: Record<string, string> = {},
): Promise<TestResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  })
  const body = (await res.json()) as T
  return {
    status: res.status,
    body,
    requestId: res.headers.get('x-request-id'),
    headers: res.headers,
  }
}

export async function post<T = unknown>(
  path: string,
  data: unknown,
  headers: Record<string, string> = {},
): Promise<TestResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })

  // Handle empty responses (e.g., 204 No Content)
  let body: T
  const contentLength = res.headers.get('content-length')
  if (res.status === 204 || contentLength === '0') {
    body = undefined as unknown as T
  } else {
    body = (await res.json()) as T
  }

  return {
    status: res.status,
    body,
    requestId: res.headers.get('x-request-id'),
    headers: res.headers,
  }
}
