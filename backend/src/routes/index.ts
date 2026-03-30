import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth-routes.js'
import { courseRoutes } from './course-routes.js'
import { AuthController } from '../controllers/auth-controller.js'
import { CourseController } from '../controllers/course-controller.js'
import { AuthService } from '../services/auth-service.js'
import { CourseService } from '../services/course-service.js'
import { PrismaUserRepository } from '../repositories/user-repository.js'
import { PrismaCourseRepository } from '../repositories/course-repository.js'
import { PrismaLessonRepository } from '../repositories/lesson-repository.js'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Composition root: wire dependencies
  const userRepository = new PrismaUserRepository()
  const courseRepository = new PrismaCourseRepository()
  const lessonRepository = new PrismaLessonRepository()

  const authService = new AuthService(userRepository)
  const courseService = new CourseService(courseRepository, lessonRepository)

  const authController = new AuthController(authService)
  const courseController = new CourseController(courseService)

  await app.register(
    async (api) => {
      await authRoutes(api, authController)
      await courseRoutes(api, courseController)
    },
    { prefix: '/api/v1' },
  )
}
