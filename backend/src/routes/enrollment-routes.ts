import type { FastifyInstance } from 'fastify'
import type { EnrollmentController } from '../controllers/enrollment-controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { EnrollmentCourseIdParamSchema } from '../dto/enrollment-dto.js'
import { zodToJsonSchema } from '../utils/zod-to-json-schema.js'
import {
  errorResponseSchema,
  successResponse,
  enrollmentResponseSchema,
} from '../dto/openapi-schemas.js'

export async function enrollmentRoutes(
  app: FastifyInstance,
  controller: EnrollmentController,
): Promise<void> {
  app.post(
    '/courses/:id/enrollments',
    {
      schema: {
        tags: ['Enrollments'],
        summary: 'Enroll in a course',
        description: 'Enrolls the authenticated learner in a published course. Idempotent: returns existing enrollment if already enrolled.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(EnrollmentCourseIdParamSchema),
        response: {
          201: successResponse(enrollmentResponseSchema),
          200: successResponse(enrollmentResponseSchema),
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [authMiddleware],
    },
    (request, reply) => controller.enroll(request, reply),
  )
}
