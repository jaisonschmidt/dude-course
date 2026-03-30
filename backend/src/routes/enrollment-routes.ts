import type { FastifyInstance } from 'fastify'
import type { EnrollmentController } from '../controllers/enrollment-controller.js'
import { authMiddleware } from '../middlewares/auth.js'

export async function enrollmentRoutes(
  app: FastifyInstance,
  controller: EnrollmentController,
): Promise<void> {
  app.post(
    '/courses/:id/enrollments',
    { preHandler: [authMiddleware] },
    (request, reply) => controller.enroll(request, reply),
  )
}
