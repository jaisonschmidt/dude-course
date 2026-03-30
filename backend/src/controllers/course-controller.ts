import type { FastifyRequest, FastifyReply } from 'fastify'
import type { CourseService } from '../services/course-service.js'
import { ListCoursesQuerySchema, CourseIdParamSchema } from '../dto/course-dto.js'
import type {
  CourseResponseDto,
  CourseDetailResponseDto,
  LessonResponseDto,
} from '../dto/course-dto.js'

export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = ListCoursesQuerySchema.parse(request.query)

    const result = await this.courseService.listPublished(query.page, query.pageSize)

    const data: CourseResponseDto[] = result.data.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }))

    return reply.status(200).send({
      data,
      meta: result.meta,
      requestId: request.id,
    })
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = CourseIdParamSchema.parse(request.params)

    const courseWithLessons = await this.courseService.getById(params.id)

    const lessons: LessonResponseDto[] = courseWithLessons.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      youtubeUrl: lesson.youtubeUrl,
      position: lesson.position,
    }))

    const data: CourseDetailResponseDto = {
      id: courseWithLessons.id,
      title: courseWithLessons.title,
      description: courseWithLessons.description,
      thumbnailUrl: courseWithLessons.thumbnailUrl,
      status: courseWithLessons.status,
      createdAt: courseWithLessons.createdAt.toISOString(),
      updatedAt: courseWithLessons.updatedAt.toISOString(),
      lessons,
    }

    return reply.status(200).send({
      data,
      requestId: request.id,
    })
  }
}
