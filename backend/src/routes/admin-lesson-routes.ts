import type { FastifyInstance } from 'fastify'
import type { AdminLessonController } from '../controllers/admin-lesson-controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { adminGuardMiddleware } from '../middlewares/admin-guard.js'

export async function adminLessonRoutes(
  app: FastifyInstance,
  controller: AdminLessonController,
): Promise<void> {
  const preHandler = [authMiddleware, adminGuardMiddleware]

  app.post(
    '/courses/:id/lessons',
    { preHandler },
    (request, reply) => controller.create(request, reply),
  )

  app.put(
    '/courses/:id/lessons/:lessonId',
    { preHandler },
    (request, reply) => controller.update(request, reply),
  )

  app.delete(
    '/courses/:id/lessons/:lessonId',
    { preHandler },
    (request, reply) => controller.delete(request, reply),
  )

  app.patch(
    '/courses/:id/lessons/reorder',
    { preHandler },
    (request, reply) => controller.reorder(request, reply),
  )
}
