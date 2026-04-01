import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AdminCourseService } from '../services/admin-course-service.js'
import {
  AdminCourseIdParamSchema,
  AdminListCoursesQuerySchema,
  CreateCourseBodySchema,
  UpdateCourseBodySchema,
} from '../dto/admin-course-dto.js'
import type { AdminCourseResponseDto } from '../dto/admin-course-dto.js'
import { logger } from '../utils/logger.js'

export class AdminCourseController {
  constructor(private readonly adminCourseService: AdminCourseService) {}

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = AdminListCoursesQuerySchema.parse(request.query)

    const result = await this.adminCourseService.listAll(query.page, query.pageSize)

    const data = result.data.map((course) => this.formatCourse(course))

    logger.info(
      { requestId: request.id, page: query.page, pageSize: query.pageSize },
      'admin.courses.listed',
    )

    return reply.status(200).send({ data, meta: result.meta, requestId: request.id })
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = CreateCourseBodySchema.parse(request.body)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    const course = await this.adminCourseService.create(body)

    const data: AdminCourseResponseDto = this.formatCourse(course)

    logger.info(
      { requestId: request.id, userId: request.user.id, courseId: course.id },
      'admin.course.created',
    )

    return reply.status(201).send({ data, requestId: request.id })
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = AdminCourseIdParamSchema.parse(request.params)
    const body = UpdateCourseBodySchema.parse(request.body)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    const course = await this.adminCourseService.update(params.id, body)

    const data: AdminCourseResponseDto = this.formatCourse(course)

    logger.info(
      { requestId: request.id, userId: request.user.id, courseId: course.id },
      'admin.course.updated',
    )

    return reply.status(200).send({ data, requestId: request.id })
  }

  async publish(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = AdminCourseIdParamSchema.parse(request.params)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    const course = await this.adminCourseService.publish(params.id)

    const data: AdminCourseResponseDto = this.formatCourse(course)

    logger.info(
      { requestId: request.id, userId: request.user.id, courseId: course.id },
      'course.published',
    )

    return reply.status(200).send({ data, requestId: request.id })
  }

  async unpublish(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = AdminCourseIdParamSchema.parse(request.params)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    const course = await this.adminCourseService.unpublish(params.id)

    const data: AdminCourseResponseDto = this.formatCourse(course)

    logger.info(
      { requestId: request.id, userId: request.user.id, courseId: course.id },
      'course.unpublished',
    )

    return reply.status(200).send({ data, requestId: request.id })
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = AdminCourseIdParamSchema.parse(request.params)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    await this.adminCourseService.delete(params.id)

    logger.info(
      { requestId: request.id, userId: request.user.id, courseId: params.id },
      'admin.course.deleted',
    )

    return reply.status(204).send()
  }

  private formatCourse(course: {
    id: number
    title: string
    description: string
    thumbnailUrl: string | null
    status: string
    createdAt: Date
    updatedAt: Date
  }): AdminCourseResponseDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }
  }
}
