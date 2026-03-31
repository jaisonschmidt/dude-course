import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EnrollmentController } from '../../../src/controllers/enrollment-controller.js'
import type { EnrollmentService } from '../../../src/services/enrollment-service.js'
import { createMockRequest, createMockReply } from '../../helpers/fastify-mocks.js'
import { createEnrollmentFactory } from '../../helpers/factories.js'

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function createMockEnrollmentService(): EnrollmentService {
  return {
    enroll: vi.fn(),
  } as unknown as EnrollmentService
}

describe('EnrollmentController', () => {
  let controller: EnrollmentController
  let mockService: EnrollmentService

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = createMockEnrollmentService()
    controller = new EnrollmentController(mockService)
  })

  describe('enroll', () => {
    it('should return 201 when enrollment is newly created', async () => {
      const enrollment = createEnrollmentFactory({ userId: 1, courseId: 10 })
      vi.mocked(mockService.enroll).mockResolvedValue({ enrollment, created: true })

      const request = createMockRequest({
        params: { id: '10' },
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.enroll(request, reply)

      expect(reply.status).toHaveBeenCalledWith(201)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 1, courseId: 10 }),
          requestId: 'test-req-id',
        }),
      )
    })

    it('should return 200 when enrollment already exists (idempotent)', async () => {
      const enrollment = createEnrollmentFactory({ userId: 1, courseId: 10 })
      vi.mocked(mockService.enroll).mockResolvedValue({ enrollment, created: false })

      const request = createMockRequest({
        params: { id: '10' },
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.enroll(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({ params: { id: '10' } })
      const reply = createMockReply()

      await controller.enroll(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        }),
      )
    })

    it('should log enrollment.created domain event on new enrollment', async () => {
      const enrollment = createEnrollmentFactory()
      vi.mocked(mockService.enroll).mockResolvedValue({ enrollment, created: true })

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        params: { id: '10' },
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.enroll(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'test-req-id' }),
        'enrollment.created',
      )
    })
  })
})
