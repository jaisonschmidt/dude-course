import type { FastifyInstance } from 'fastify'
import type { AuthController } from '../controllers/auth-controller.js'
import { authMiddleware } from '../middlewares/auth.js'

export async function authRoutes(app: FastifyInstance, controller: AuthController): Promise<void> {
  app.post('/auth/register', (request, reply) => controller.register(request, reply))
  app.post('/auth/login', (request, reply) => controller.login(request, reply))
  app.post('/auth/logout', { preHandler: [authMiddleware] }, (request, reply) => controller.logout(request, reply))
}
