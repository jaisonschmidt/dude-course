import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CertificateController } from '../../../src/controllers/certificate-controller.js'
import type { CertificateService } from '../../../src/services/certificate-service.js'
import { createMockRequest, createMockReply } from '../../helpers/fastify-mocks.js'
import { createCertificateFactory } from '../../helpers/factories.js'

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function createMockCertificateService(): CertificateService {
  return {
    generateOrGet: vi.fn(),
  } as unknown as CertificateService
}

describe('CertificateController', () => {
  let controller: CertificateController
  let mockService: CertificateService

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = createMockCertificateService()
    controller = new CertificateController(mockService)
  })

  describe('generateOrGet', () => {
    it('should return 200 with certificate data when user is authenticated', async () => {
      const certificate = createCertificateFactory({ courseId: 10, userId: 1 })
      vi.mocked(mockService.generateOrGet).mockResolvedValue({
        certificate,
        isNew: false,
        courseName: 'Test Course',
        learnerName: 'Jane',
      })

      const request = createMockRequest({
        params: { id: '10' },
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.generateOrGet(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            certificateCode: certificate.certificateCode,
            courseName: 'Test Course',
            learnerName: 'Jane',
          }),
          requestId: 'test-req-id',
        }),
      )
    })

    it('should log certificate.issued event when certificate is new', async () => {
      const certificate = createCertificateFactory({ courseId: 10, userId: 1 })
      vi.mocked(mockService.generateOrGet).mockResolvedValue({
        certificate,
        isNew: true,
        courseName: 'Test Course',
        learnerName: 'Jane',
      })

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        params: { id: '10' },
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.generateOrGet(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'test-req-id', certificateCode: certificate.certificateCode }),
        'certificate.issued',
      )
    })

    it('should not log certificate.issued when certificate already exists', async () => {
      const certificate = createCertificateFactory()
      vi.mocked(mockService.generateOrGet).mockResolvedValue({
        certificate,
        isNew: false,
        courseName: 'Test',
        learnerName: 'Jane',
      })

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        params: { id: '10' },
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.generateOrGet(request, reply)

      expect(logger.info).not.toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({ params: { id: '10' } })
      const reply = createMockReply()

      await controller.generateOrGet(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        }),
      )
    })
  })
})
