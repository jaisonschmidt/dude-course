import type { Course, CreateCourseData, CourseStatus } from '../models/course.js'

export interface ICourseRepository {
  findById(id: number): Promise<Course | null>
  findAllPublished(page: number, pageSize: number): Promise<{ items: Course[]; total: number }>
  create(data: CreateCourseData): Promise<Course>
  updateStatus(id: number, status: CourseStatus): Promise<Course>
}

export class PrismaCourseRepository implements ICourseRepository {
  async findById(_id: number): Promise<Course | null> {
    // TODO: implement with Prisma
    throw new Error('PrismaCourseRepository.findById not implemented')
  }

  async findAllPublished(
    _page: number,
    _pageSize: number,
  ): Promise<{ items: Course[]; total: number }> {
    // TODO: implement with Prisma
    throw new Error('PrismaCourseRepository.findAllPublished not implemented')
  }

  async create(_data: CreateCourseData): Promise<Course> {
    // TODO: implement with Prisma
    throw new Error('PrismaCourseRepository.create not implemented')
  }

  async updateStatus(_id: number, _status: CourseStatus): Promise<Course> {
    // TODO: implement with Prisma
    throw new Error('PrismaCourseRepository.updateStatus not implemented')
  }
}
