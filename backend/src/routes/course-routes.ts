import type { FastifyInstance } from 'fastify'
import type { CourseController } from '../controllers/course-controller.js'

export async function courseRoutes(app: FastifyInstance, controller: CourseController): Promise<void> {
  app.get('/courses', (request, reply) => controller.list(request, reply))
  app.get('/courses/:id', (request, reply) => controller.getById(request, reply))
}
