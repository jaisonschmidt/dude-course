const API_BASE_URL = process.env.E2E_API_URL || 'http://localhost:3001/api/v1'

interface ApiResponse<T = unknown> {
  data: T
  requestId: string
}

interface ApiErrorResponse {
  error: {
    code: string
    message: string
    requestId: string
    details?: unknown
  }
}

type ApiResult<T> = { status: number; body: ApiResponse<T> | ApiErrorResponse }

export async function apiPost<T = unknown>(
  path: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const responseBody = await response.json()
  return { status: response.status, body: responseBody }
}

export async function apiGet<T = unknown>(
  path: string,
  token?: string,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers,
  })

  const responseBody = await response.json()
  return { status: response.status, body: responseBody }
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: Record<string, unknown>,
  token?: string,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const responseBody = await response.json()
  return { status: response.status, body: responseBody }
}

export async function apiPut<T = unknown>(
  path: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })

  const responseBody = await response.json()
  return { status: response.status, body: responseBody }
}

export async function apiDelete(
  path: string,
  token?: string,
): Promise<{ status: number }> {
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers,
  })

  return { status: response.status }
}
