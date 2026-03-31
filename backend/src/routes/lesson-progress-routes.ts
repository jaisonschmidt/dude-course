import type { FastifyInstance } from 'fastify'
import type { LessonProgressController } from '../controllers/lesson-progress-controller.js'
import { authMiddleware } from '../middlewares/auth.js'

export async function lessonProgressRoutes(
  app: FastifyInstance,
  controller: LessonProgressController,
): Promise<void> {
  app.post(
    '/courses/:courseId/lessons/:lessonId/progress',
    { preHandler: [authMiddleware] },
    (request, reply) => controller.markCompleted(request, reply),
  )
}
