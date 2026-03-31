import type { FastifyRequest, FastifyReply } from 'fastify'
import type { EnrollmentService } from '../services/enrollment-service.js'
import { EnrollmentCourseIdParamSchema } from '../dto/enrollment-dto.js'
import type { EnrollmentResponseDto } from '../dto/enrollment-dto.js'
import { logger } from '../utils/logger.js'

export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  async enroll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = EnrollmentCourseIdParamSchema.parse(request.params)
    const userId = request.user!.id

    const result = await this.enrollmentService.enroll(userId, params.id)

    const data: EnrollmentResponseDto = {
      id: result.enrollment.id,
      userId: result.enrollment.userId,
      courseId: result.enrollment.courseId,
      startedAt: result.enrollment.startedAt.toISOString(),
    }

    const statusCode = result.created ? 201 : 200

    if (result.created) {
      logger.info(
        { requestId: request.id, userId, courseId: params.id },
        'enrollment.created',
      )
    }

    return reply.status(statusCode).send({ data, requestId: request.id })
  }
}
