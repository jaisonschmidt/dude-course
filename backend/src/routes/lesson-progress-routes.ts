import type { FastifyInstance } from 'fastify'
import type { LessonProgressController } from '../controllers/lesson-progress-controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { LessonProgressParamsSchema } from '../dto/lesson-progress-dto.js'
import { zodToJsonSchema } from '../utils/zod-to-json-schema.js'
import {
  errorResponseSchema,
  successResponse,
  lessonProgressResponseSchema,
} from '../dto/openapi-schemas.js'

export async function lessonProgressRoutes(
  app: FastifyInstance,
  controller: LessonProgressController,
): Promise<void> {
  app.post(
    '/courses/:courseId/lessons/:lessonId/progress',
    {
      schema: {
        tags: ['Lesson Progress'],
        summary: 'Mark lesson as completed',
        description: 'Marks a lesson as completed for the authenticated learner. Idempotent: returns existing progress if already completed. Auto-completes the enrollment when all lessons are done.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(LessonProgressParamsSchema),
        response: {
          200: successResponse(lessonProgressResponseSchema),
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [authMiddleware],
    },
    (request, reply) => controller.markCompleted(request, reply),
  )
}
