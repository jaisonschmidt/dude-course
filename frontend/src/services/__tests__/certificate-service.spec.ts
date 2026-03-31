import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateCertificate } from '../certificate-service'

const mockApiRequest = vi.fn()
vi.mock('../api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

describe('certificateService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateCertificate', () => {
    it('deve chamar POST /courses/:id/certificate', async () => {
      const mockCert = {
        id: 1,
        certificateCode: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        issuedAt: '2026-01-20T14:05:00.000Z',
        courseName: 'TypeScript Mastery',
        learnerName: 'Jane Doe',
      }
      mockApiRequest.mockResolvedValueOnce({ data: mockCert, requestId: 'req-1' })

      const result = await generateCertificate(2)

      expect(mockApiRequest).toHaveBeenCalledWith('/courses/2/certificate', { method: 'POST' })
      expect(result).toEqual(mockCert)
    })

    it('deve retornar certificado existente (idempotente)', async () => {
      const mockCert = {
        id: 1,
        certificateCode: 'same-code',
        issuedAt: '2026-01-20T14:05:00.000Z',
        courseName: 'TypeScript',
        learnerName: 'Jane',
      }
      mockApiRequest.mockResolvedValueOnce({ data: mockCert, requestId: 'req-2' })

      const result = await generateCertificate(2)

      expect(result.certificateCode).toBe('same-code')
    })
  })
})
