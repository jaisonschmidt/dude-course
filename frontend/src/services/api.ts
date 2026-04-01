/**
 * Cliente HTTP para a API do backend.
 *
 * BASE_URL é lida de NEXT_PUBLIC_API_URL (incluindo o prefixo /api/v1).
 * Exemplo: NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
 */

export interface ApiResponse<T = unknown> {
  data: T
  requestId: string
}

export interface ApiErrorDetail {
  field: string
  message: string
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly requestId: string,
    public readonly details?: ApiErrorDetail[],
  ) {
    super(message)
    this.name = 'AppError'
  }
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

/** Global handler for 401 responses (token expired / invalid). */
let onUnauthorizedHandler: (() => void) | null = null

/**
 * Register a global handler to be called when API returns 401.
 * Used by AuthProvider to auto-logout + redirect.
 */
export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorizedHandler = handler
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const token = getToken()
  const { body, headers: optionHeaders, ...restOptions } = options

  const headers: Record<string, string> = {
    ...(body !== undefined && { 'Content-Type': 'application/json' }),
    ...(optionHeaders as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...restOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const requestId = response.headers.get('x-request-id') ?? ''

  if (!response.ok) {
    let errorBody: { error?: { code?: string; message?: string; details?: ApiErrorDetail[]; requestId?: string } } = {}
    try {
      errorBody = await response.json()
    } catch {
      // ignora erros de parse do body
    }

    const err = errorBody.error
    const code = err?.code ?? httpStatusToCode(response.status)
    const message = err?.message ?? httpStatusToMessage(response.status)

    // Auto-handle 401: notify global handler for token expiry
    if (response.status === 401 && onUnauthorizedHandler) {
      onUnauthorizedHandler()
    }

    throw new AppError(code, message, requestId, err?.details)
  }

  if (response.status === 204) {
    return { data: null as T, requestId }
  }

  const json = await response.json()
  return { data: json.data as T, requestId: json.requestId ?? requestId }
}

function httpStatusToCode(status: number): string {
  const codes: Record<number, string> = {
    400: 'VALIDATION_ERROR',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    500: 'INTERNAL_ERROR',
  }
  return codes[status] ?? 'INTERNAL_ERROR'
}

function httpStatusToMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Requisição inválida.',
    401: 'Não autorizado. Faça login novamente.',
    403: 'Acesso não permitido.',
    404: 'Recurso não encontrado.',
    409: 'Conflito com recurso existente.',
    500: 'Erro interno do servidor. Tente novamente mais tarde.',
  }
  return messages[status] ?? 'Erro inesperado.'
}
