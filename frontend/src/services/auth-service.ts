import { apiRequest } from './api'

// TODO: Avaliar uso de httpOnly cookies para armazenamento do token em produção
// TODO: Implementar refresh token quando a expiração se aproximar
// TODO: Adicionar lógica de renovação automática silenciosa do token

const TOKEN_KEY = 'auth_token'

export interface UserInfo {
  id: number
  name: string
  email: string
  role: string
}

export interface LoginResponse {
  accessToken: string
  expiresIn: string
  user: UserInfo
}

export interface RegisterResponse {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

/**
 * Sets a cookie accessible by Next.js middleware for route protection.
 * This is NOT httpOnly — it's a routing hint, not a security mechanism.
 */
function syncTokenCookie(token: string | null): void {
  if (typeof document === 'undefined') return
  if (token) {
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`
  } else {
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

/**
 * Autentica o usuário e armazena o token no localStorage.
 * Em produção, considerar migração para httpOnly cookie.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })

  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    syncTokenCookie(data.accessToken)
  }

  return data
}

/**
 * Registra um novo usuário.
 */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  const { data } = await apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })

  return data
}

/**
 * Remove o token do localStorage (logout client-side — JWT stateless).
 * Se blacklist de tokens for necessária no futuro, chamar POST /auth/logout antes.
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    syncTokenCookie(null)
  }
}

/**
 * Retorna o token armazenado ou null se não autenticado.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}
