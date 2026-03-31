import type { FastifyInstance } from 'fastify'
import type { CourseController } from '../controllers/course-controller.js'
import { ListCoursesQuerySchema, CourseIdParamSchema } from '../dto/course-dto.js'
import { zodToJsonSchema } from '../utils/zod-to-json-schema.js'
import {
  errorResponseSchema,
  successResponse,
  paginatedResponse,
  courseResponseSchema,
  lessonResponseSchema,
} from '../dto/openapi-schemas.js'

const courseDetailSchema = {
  ...courseResponseSchema,
  properties: {
    ...courseResponseSchema.properties,
    lessons: {
      type: 'array' as const,
      items: lessonResponseSchema,
    },
  },
}

export async function courseRoutes(app: FastifyInstance, controller: CourseController): Promise<void> {
  app.get('/courses', {
    schema: {
      tags: ['Courses'],
      summary: 'List published courses',
      description: 'Returns a paginated list of published courses for the public catalog.',
      querystring: zodToJsonSchema(ListCoursesQuerySchema),
      response: {
        200: paginatedResponse(courseResponseSchema),
      },
    },
  }, (request, reply) => controller.list(request, reply))

  app.get('/courses/:id', {
    schema: {
      tags: ['Courses'],
      summary: 'Get course details',
      description: 'Returns a published course with its ordered list of lessons.',
      params: zodToJsonSchema(CourseIdParamSchema),
      response: {
        200: successResponse(courseDetailSchema),
        404: errorResponseSchema,
      },
    },
  }, (request, reply) => controller.getById(request, reply))
}
