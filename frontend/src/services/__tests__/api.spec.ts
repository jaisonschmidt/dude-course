import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError, apiRequest } from '../api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('BASE_URL', () => {
    it('usa NEXT_PUBLIC_API_URL ao construir a URL da requisição', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: {}, requestId: '' }),
      })

      await apiRequest('/auth/login', { method: 'POST', body: {} })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.any(Object),
      )
    })
  })

  describe('apiRequest', () => {
    it('captura X-Request-Id do header de resposta', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req_test_123' }),
        json: async () => ({ data: { foo: 'bar' }, requestId: 'req_test_123' }),
      })

      const result = await apiRequest('/test')

      expect(result.requestId).toBe('req_test_123')
    })

    it('inclui Authorization header quando token está no localStorage', async () => {
      localStorage.setItem('auth_token', 'fake_jwt_token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: {}, requestId: '' }),
      })

      await apiRequest('/test', { method: 'GET' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake_jwt_token',
          }),
        }),
      )
    })

    it('não inclui Authorization header quando token está ausente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: {}, requestId: '' }),
      })

      await apiRequest('/test')

      const calledHeaders = mockFetch.mock.calls[0][1].headers as Record<string, string>
      expect(calledHeaders['Authorization']).toBeUndefined()
    })

    it('lança AppError com código UNAUTHORIZED para status 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'x-request-id': 'req_err_401' }),
        json: async () => ({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token inválido',
            requestId: 'req_err_401',
          },
        }),
      })

      await expect(apiRequest('/protected')).rejects.toBeInstanceOf(AppError)
    })

    it('lança AppError com código NOT_FOUND para status 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
        json: async () => ({}),
      })

      const error = await apiRequest('/missing').catch((e) => e)
      expect(error).toBeInstanceOf(AppError)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('retorna { data: null } para status 204', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers({ 'x-request-id': 'req_204' }),
        json: async () => ({}),
      })

      const result = await apiRequest('/auth/logout', { method: 'POST' })
      expect(result.data).toBeNull()
    })
  })
})
