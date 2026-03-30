'use client'

import { useState } from 'react'

// TODO: Implementar hook de autenticação completo
// TODO: Integrar com auth-service.ts (login, register, logout)
// TODO: Gerenciar estado do usuário autenticado (Context API ou Zustand)
// TODO: Lidar com expiração do token e redirecionar para /login
// TODO: Avaliar migração do token para httpOnly cookie em produção

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
}

export function useAuth(): AuthState {
  const [state] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
  })

  return state
}
