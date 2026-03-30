'use client'

import { useState, useCallback } from 'react'
import { apiRequest, AppError } from '@/services/api'

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  requestId: string | null
}

interface UseApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (path: string, options?: UseApiOptions) => Promise<T | null>
  reset: () => void
}

/**
 * Hook genérico para chamadas à API.
 *
 * Gerencia estados de loading, erro e sucesso.
 * Lança AppError com requestId em caso de falha.
 * Em caso de UNAUTHORIZED, deve redirecionar para /login (TODO: integrar com router).
 */
export function useApi<T = unknown>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
    requestId: null,
  })

  const execute = useCallback(
    async (path: string, options: UseApiOptions = {}): Promise<T | null> => {
      setState({ data: null, isLoading: true, error: null, requestId: null })

      try {
        const response = await apiRequest<T>(path, options)
        setState({
          data: response.data,
          isLoading: false,
          error: null,
          requestId: response.requestId,
        })
        return response.data
      } catch (err) {
        if (err instanceof AppError) {
          // TODO: redirecionar para /login ao detectar token expirado
          // usar useRouter do Next.js quando integrado em contexto de autenticação
          setState({
            data: null,
            isLoading: false,
            error: err.message,
            requestId: err.requestId,
          })
        } else {
          setState({
            data: null,
            isLoading: false,
            error: 'Erro inesperado. Tente novamente.',
            requestId: null,
          })
        }
        return null
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null, requestId: null })
  }, [])

  return { ...state, execute, reset }
}
