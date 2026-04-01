import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AdminLessonService } from '../services/admin-lesson-service.js'
import {
  AdminLessonCourseIdParamSchema,
  AdminLessonParamSchema,
  CreateLessonBodySchema,
  UpdateLessonBodySchema,
  ReorderLessonsBodySchema,
} from '../dto/admin-lesson-dto.js'
import type { AdminLessonResponseDto } from '../dto/admin-lesson-dto.js'
import { logger } from '../utils/logger.js'

export class AdminLessonController {
  constructor(private readonly adminLessonService: AdminLessonService) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = AdminLessonCourseIdParamSchema.parse(request.params)
    const body = CreateLessonBodySchema.parse(request.body)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    const lesson = await this.adminLessonService.create(params.id, body)

    const data: AdminLessonResponseDto = this.formatLesson(lesson)

    logger.info(
      { requestId: request.id, userId: request.user.id, courseId: params.id, lessonId: lesson.id },
      'admin.lesson.created',
    )

    return reply.status(201).send({ data, requestId: request.id })
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = AdminLessonParamSchema.parse(request.params)
    const body = UpdateLessonBodySchema.parse(request.body)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    const lesson = await this.adminLessonService.update(params.id, params.lessonId, body)

    const data: AdminLessonResponseDto = this.formatLesson(lesson)

    logger.info(
      { requestId: request.id, userId: request.user.id, courseId: params.id, lessonId: lesson.id },
      'admin.lesson.updated',
    )

    return reply.status(200).send({ data, requestId: request.id })
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = AdminLessonParamSchema.parse(request.params)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    await this.adminLessonService.delete(params.id, params.lessonId)

    logger.info(
      { requestId: request.id, userId: request.user.id, courseId: params.id, lessonId: params.lessonId },
      'admin.lesson.deleted',
    )

    return reply.status(204).send()
  }

  async reorder(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = AdminLessonCourseIdParamSchema.parse(request.params)
    const body = ReorderLessonsBodySchema.parse(request.body)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    const lessons = await this.adminLessonService.reorder(params.id, body.lessons)

    const data: AdminLessonResponseDto[] = lessons.map((l) => this.formatLesson(l))

    logger.info(
      { requestId: request.id, userId: request.user.id, courseId: params.id },
      'admin.lessons.reordered',
    )

    return reply.status(200).send({ data, requestId: request.id })
  }

  private formatLesson(lesson: {
    id: number
    courseId: number
    title: string
    description: string | null
    youtubeUrl: string
    position: number
    createdAt: Date
    updatedAt: Date
  }): AdminLessonResponseDto {
    return {
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      youtubeUrl: lesson.youtubeUrl,
      position: lesson.position,
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString(),
    }
  }
}
