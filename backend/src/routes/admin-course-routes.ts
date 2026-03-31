import type { FastifyInstance } from 'fastify'
import type { AdminCourseController } from '../controllers/admin-course-controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { adminGuardMiddleware } from '../middlewares/admin-guard.js'

export async function adminCourseRoutes(
  app: FastifyInstance,
  controller: AdminCourseController,
): Promise<void> {
  const preHandler = [authMiddleware, adminGuardMiddleware]

  app.post(
    '/courses',
    { preHandler },
    (request, reply) => controller.create(request, reply),
  )

  app.put(
    '/courses/:id',
    { preHandler },
    (request, reply) => controller.update(request, reply),
  )

  app.patch(
    '/courses/:id/publish',
    { preHandler },
    (request, reply) => controller.publish(request, reply),
  )

  app.patch(
    '/courses/:id/unpublish',
    { preHandler },
    (request, reply) => controller.unpublish(request, reply),
  )

  app.delete(
    '/courses/:id',
    { preHandler },
    (request, reply) => controller.delete(request, reply),
  )
}
