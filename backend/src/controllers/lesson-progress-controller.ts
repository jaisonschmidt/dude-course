import type { FastifyRequest, FastifyReply } from 'fastify'
import type { LessonProgressService } from '../services/lesson-progress-service.js'
import { LessonProgressParamsSchema } from '../dto/lesson-progress-dto.js'
import type { LessonProgressResponseDto } from '../dto/lesson-progress-dto.js'
import { logger } from '../utils/logger.js'

export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  async markCompleted(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = LessonProgressParamsSchema.parse(request.params)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    const userId = request.user.id

    const result = await this.lessonProgressService.markCompleted(
      userId,
      params.courseId,
      params.lessonId,
    )

    const data: LessonProgressResponseDto = {
      id: result.progress.id,
      userId: result.progress.userId,
      courseId: result.progress.courseId,
      lessonId: result.progress.lessonId,
      completedAt: result.progress.completedAt.toISOString(),
    }

    logger.info(
      { requestId: request.id, userId, courseId: params.courseId, lessonId: params.lessonId },
      'lesson-progress.completed',
    )

    if (result.autoCompleted) {
      logger.info(
        { requestId: request.id, userId, courseId: params.courseId },
        'enrollment.completed',
      )
    }

    return reply.status(200).send({ data, requestId: request.id })
  }
}
