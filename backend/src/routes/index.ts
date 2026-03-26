import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth-routes.js'
import { AuthController } from '../controllers/auth-controller.js'
import { AuthService } from '../services/auth-service.js'
import { PrismaUserRepository } from '../repositories/user-repository.js'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Composition root: wire dependencies
  const userRepository = new PrismaUserRepository()
  const authService = new AuthService(userRepository)
  const authController = new AuthController(authService)

  await app.register(
    async (api) => {
      await authRoutes(api, authController)
      // TODO: register additional route groups here (courses, enrollments, etc.)
    },
    { prefix: '/api/v1' },
  )
}
