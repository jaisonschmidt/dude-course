import type { FastifyInstance } from 'fastify'
import type { AdminCourseController } from '../controllers/admin-course-controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { adminGuardMiddleware } from '../middlewares/admin-guard.js'
import {
  AdminCourseIdParamSchema,
  AdminListCoursesQuerySchema,
  CreateCourseBodySchema,
  UpdateCourseBodySchema,
} from '../dto/admin-course-dto.js'
import { zodToJsonSchema } from '../utils/zod-to-json-schema.js'
import {
  errorResponseSchema,
  successResponse,
  paginatedResponse,
  courseResponseSchema,
  adminLessonResponseSchema,
} from '../dto/openapi-schemas.js'

const adminCourseDetailSchema = {
  ...courseResponseSchema,
  properties: {
    ...courseResponseSchema.properties,
    lessons: {
      type: 'array' as const,
      items: adminLessonResponseSchema,
    },
  },
}

export async function adminCourseRoutes(
  app: FastifyInstance,
  controller: AdminCourseController,
): Promise<void> {
  const preHandler = [authMiddleware, adminGuardMiddleware]

  app.get(
    '/admin/courses',
    {
      schema: {
        tags: ['Admin: Courses'],
        summary: 'List all courses (admin)',
        description: 'Lists all courses regardless of status, with pagination. Requires admin role.',
        security: [{ bearerAuth: [] }],
        querystring: zodToJsonSchema(AdminListCoursesQuerySchema),
        response: {
          200: paginatedResponse(courseResponseSchema),
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler,
    },
    (request, reply) => controller.list(request, reply),
  )

  app.get(
    '/admin/courses/:id',
    {
      schema: {
        tags: ['Admin: Courses'],
        summary: 'Get course details (admin)',
        description: 'Returns a course with its lessons regardless of status. Requires admin role.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(AdminCourseIdParamSchema),
        response: {
          200: successResponse(adminCourseDetailSchema),
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler,
    },
    (request, reply) => controller.getById(request, reply),
  )

  app.post(
    '/courses',
    {
      schema: {
        tags: ['Admin: Courses'],
        summary: 'Create a new course',
        description: 'Creates a new course with status "draft". Requires admin role.',
        security: [{ bearerAuth: [] }],
        body: zodToJsonSchema(CreateCourseBodySchema),
        response: {
          201: successResponse(courseResponseSchema),
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler,
    },
    (request, reply) => controller.create(request, reply),
  )

  app.put(
    '/courses/:id',
    {
      schema: {
        tags: ['Admin: Courses'],
        summary: 'Update a course',
        description: 'Updates an existing course. Requires admin role.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(AdminCourseIdParamSchema),
        body: zodToJsonSchema(UpdateCourseBodySchema),
        response: {
          200: successResponse(courseResponseSchema),
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

  app.patch(
    '/courses/:id/publish',
    {
      schema: {
        tags: ['Admin: Courses'],
        summary: 'Publish a course',
        description: 'Publishes a course, making it visible in the public catalog. Requires title, description, and at least 1 lesson.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(AdminCourseIdParamSchema),
        response: {
          200: successResponse(courseResponseSchema),
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler,
    },
    (request, reply) => controller.publish(request, reply),
  )

  app.patch(
    '/courses/:id/unpublish',
    {
      schema: {
        tags: ['Admin: Courses'],
        summary: 'Unpublish a course',
        description: 'Unpublishes a course, removing it from the public catalog.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(AdminCourseIdParamSchema),
        response: {
          200: successResponse(courseResponseSchema),
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler,
    },
    (request, reply) => controller.unpublish(request, reply),
  )

  app.delete(
    '/courses/:id',
    {
      schema: {
        tags: ['Admin: Courses'],
        summary: 'Delete a course',
        description: 'Deletes a course. Referential integrity constraints may prevent deletion if enrollments exist.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(AdminCourseIdParamSchema),
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
}
