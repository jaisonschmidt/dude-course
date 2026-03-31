import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, AppError, setOnUnauthorized } from '../api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('api 401 auto-redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setOnUnauthorized(null)
  })

  it('deve chamar handler global ao receber 401', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'x-request-id': 'r1' }),
      json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Token expired' } }),
    })

    await expect(apiRequest('/test')).rejects.toThrow(AppError)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('não deve chamar handler para outros erros', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'x-request-id': 'r2' }),
      json: async () => ({ error: { code: 'NOT_FOUND', message: 'Not found' } }),
    })

    await expect(apiRequest('/test')).rejects.toThrow(AppError)
    expect(handler).not.toHaveBeenCalled()
  })

  it('não deve falhar sem handler registrado', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'x-request-id': 'r3' }),
      json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Expired' } }),
    })

    await expect(apiRequest('/test')).rejects.toThrow(AppError)
  })
})
