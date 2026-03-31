import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth-routes.js'
import { courseRoutes } from './course-routes.js'
import { enrollmentRoutes } from './enrollment-routes.js'
import { lessonProgressRoutes } from './lesson-progress-routes.js'
import { AuthController } from '../controllers/auth-controller.js'
import { CourseController } from '../controllers/course-controller.js'
import { EnrollmentController } from '../controllers/enrollment-controller.js'
import { LessonProgressController } from '../controllers/lesson-progress-controller.js'
import { AuthService } from '../services/auth-service.js'
import { CourseService } from '../services/course-service.js'
import { EnrollmentService } from '../services/enrollment-service.js'
import { LessonProgressService } from '../services/lesson-progress-service.js'
import { PrismaUserRepository } from '../repositories/user-repository.js'
import { PrismaCourseRepository } from '../repositories/course-repository.js'
import { PrismaLessonRepository } from '../repositories/lesson-repository.js'
import { PrismaEnrollmentRepository } from '../repositories/enrollment-repository.js'
import { PrismaLessonProgressRepository } from '../repositories/lesson-progress-repository.js'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Composition root: wire dependencies
  const userRepository = new PrismaUserRepository()
  const courseRepository = new PrismaCourseRepository()
  const lessonRepository = new PrismaLessonRepository()
  const enrollmentRepository = new PrismaEnrollmentRepository()
  const lessonProgressRepository = new PrismaLessonProgressRepository()

  const authService = new AuthService(userRepository)
  const courseService = new CourseService(courseRepository, lessonRepository)
  const enrollmentService = new EnrollmentService(enrollmentRepository, courseRepository)
  const lessonProgressService = new LessonProgressService(
    lessonProgressRepository,
    lessonRepository,
    enrollmentRepository,
  )

  const authController = new AuthController(authService)
  const courseController = new CourseController(courseService)
  const enrollmentController = new EnrollmentController(enrollmentService)
  const lessonProgressController = new LessonProgressController(lessonProgressService)

  await app.register(
    async (api) => {
      await authRoutes(api, authController)
      await courseRoutes(api, courseController)
      await enrollmentRoutes(api, enrollmentController)
      await lessonProgressRoutes(api, lessonProgressController)
    },
    { prefix: '/api/v1' },
  )
}
