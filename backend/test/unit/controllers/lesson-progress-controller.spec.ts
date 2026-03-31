import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LessonProgressController } from '../../../src/controllers/lesson-progress-controller.js'
import type { LessonProgressService } from '../../../src/services/lesson-progress-service.js'
import { createMockRequest, createMockReply } from '../../helpers/fastify-mocks.js'
import { createLessonProgressFactory } from '../../helpers/factories.js'

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function createMockLessonProgressService(): LessonProgressService {
  return {
    markCompleted: vi.fn(),
  } as unknown as LessonProgressService
}

describe('LessonProgressController', () => {
  let controller: LessonProgressController
  let mockService: LessonProgressService

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = createMockLessonProgressService()
    controller = new LessonProgressController(mockService)
  })

  describe('markCompleted', () => {
    it('should return 200 with progress data', async () => {
      const progress = createLessonProgressFactory({ userId: 1, courseId: 10, lessonId: 100 })
      vi.mocked(mockService.markCompleted).mockResolvedValue({
        progress,
        autoCompleted: false,
      })

      const request = createMockRequest({
        params: { courseId: '10', lessonId: '100' },
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.markCompleted(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 1,
            courseId: 10,
            lessonId: 100,
          }),
          requestId: 'test-req-id',
        }),
      )
    })

    it('should log lesson-progress.completed domain event', async () => {
      const progress = createLessonProgressFactory()
      vi.mocked(mockService.markCompleted).mockResolvedValue({
        progress,
        autoCompleted: false,
      })

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        params: { courseId: '10', lessonId: '100' },
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.markCompleted(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'test-req-id', courseId: 10, lessonId: 100 }),
        'lesson-progress.completed',
      )
    })

    it('should log enrollment.completed when auto-completed', async () => {
      const progress = createLessonProgressFactory()
      vi.mocked(mockService.markCompleted).mockResolvedValue({
        progress,
        autoCompleted: true,
      })

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        params: { courseId: '10', lessonId: '100' },
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.markCompleted(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'test-req-id', courseId: 10 }),
        'enrollment.completed',
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({
        params: { courseId: '10', lessonId: '100' },
      })
      const reply = createMockReply()

      await controller.markCompleted(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        }),
      )
    })
  })
})
