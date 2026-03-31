import type { FastifyInstance } from 'fastify'
import type { AdminLessonController } from '../controllers/admin-lesson-controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { adminGuardMiddleware } from '../middlewares/admin-guard.js'
import {
  AdminLessonCourseIdParamSchema,
  AdminLessonParamSchema,
  CreateLessonBodySchema,
  UpdateLessonBodySchema,
  ReorderLessonsBodySchema,
} from '../dto/admin-lesson-dto.js'
import { zodToJsonSchema } from '../utils/zod-to-json-schema.js'
import {
  errorResponseSchema,
  successResponse,
  adminLessonResponseSchema,
} from '../dto/openapi-schemas.js'

export async function adminLessonRoutes(
  app: FastifyInstance,
  controller: AdminLessonController,
): Promise<void> {
  const preHandler = [authMiddleware, adminGuardMiddleware]

  app.post(
    '/courses/:id/lessons',
    {
      schema: {
        tags: ['Admin: Lessons'],
        summary: 'Create a lesson',
        description: 'Creates a new lesson in a course. Requires admin role.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(AdminLessonCourseIdParamSchema),
        body: zodToJsonSchema(CreateLessonBodySchema),
        response: {
          201: successResponse(adminLessonResponseSchema),
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
      preHandler,
    },
    (request, reply) => controller.create(request, reply),
  )

  app.put(
    '/courses/:id/lessons/:lessonId',
    {
      schema: {
        tags: ['Admin: Lessons'],
        summary: 'Update a lesson',
        description: 'Updates an existing lesson. Requires admin role.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(AdminLessonParamSchema),
        body: zodToJsonSchema(UpdateLessonBodySchema),
        response: {
          200: successResponse(adminLessonResponseSchema),
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler,
    },
    (request, reply) => controller.update(request, reply),
  )

  app.delete(
    '/courses/:id/lessons/:lessonId',
    {
      schema: {
        tags: ['Admin: Lessons'],
        summary: 'Delete a lesson',
        description: 'Removes a lesson from a course. Requires admin role.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(AdminLessonParamSchema),
        response: {
          200: successResponse({ type: 'object' as const }),
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler,
    },
    (request, reply) => controller.delete(request, reply),
  )

  app.patch(
    '/courses/:id/lessons/reorder',
    {
      schema: {
        tags: ['Admin: Lessons'],
        summary: 'Reorder lessons',
        description: 'Reorders lessons within a course by specifying new positions. Requires admin role.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(AdminLessonCourseIdParamSchema),
        body: zodToJsonSchema(ReorderLessonsBodySchema),
        response: {
          200: {
            type: 'object' as const,
            properties: {
              data: {
                type: 'array' as const,
                items: adminLessonResponseSchema,
              },
              requestId: { type: 'string' as const },
            },
            required: ['data', 'requestId'],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler,
    },
    (request, reply) => controller.reorder(request, reply),
  )
}
