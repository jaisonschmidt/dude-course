import type { Enrollment, CreateEnrollmentData } from '../models/enrollment.js'

export interface IEnrollmentRepository {
  findByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | null>
  findByUserId(userId: number): Promise<Enrollment[]>
  create(data: CreateEnrollmentData): Promise<Enrollment>
  markCompleted(id: number): Promise<Enrollment>
}

export class PrismaEnrollmentRepository implements IEnrollmentRepository {
  async findByUserAndCourse(_userId: number, _courseId: number): Promise<Enrollment | null> {
    // TODO: implement with Prisma
    throw new Error('PrismaEnrollmentRepository.findByUserAndCourse not implemented')
  }

  async findByUserId(_userId: number): Promise<Enrollment[]> {
    // TODO: implement with Prisma
    throw new Error('PrismaEnrollmentRepository.findByUserId not implemented')
  }

  async create(_data: CreateEnrollmentData): Promise<Enrollment> {
    // TODO: implement with Prisma
    throw new Error('PrismaEnrollmentRepository.create not implemented')
  }

  async markCompleted(_id: number): Promise<Enrollment> {
    // TODO: implement with Prisma
    throw new Error('PrismaEnrollmentRepository.markCompleted not implemented')
  }
}
