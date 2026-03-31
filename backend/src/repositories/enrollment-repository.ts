import type { Enrollment, CreateEnrollmentData } from '../models/enrollment.js'
import { prisma } from 'database'
import { isRecordNotFoundError } from '../utils/prisma-errors.js'

export interface IEnrollmentRepository {
  create(data: CreateEnrollmentData): Promise<Enrollment>
  findById(id: number): Promise<Enrollment | null>
  findByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | null>
  findByUserId(userId: number): Promise<Enrollment[]>
  markCompleted(id: number, completedAt: Date): Promise<Enrollment | null>
  delete(id: number): Promise<boolean>
}

export class PrismaEnrollmentRepository implements IEnrollmentRepository {
  async create(data: CreateEnrollmentData): Promise<Enrollment> {
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
      },
    })

    return this.mapToEnrollment(enrollment)
  }

  async findById(id: number): Promise<Enrollment | null> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      return null
    }

    return this.mapToEnrollment(enrollment)
  }

  async findByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | null> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    })

    if (!enrollment) {
      return null
    }

    return this.mapToEnrollment(enrollment)
  }

  async findByUserId(userId: number): Promise<Enrollment[]> {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
    })

    return enrollments.map((e) => this.mapToEnrollment(e))
  }

  async markCompleted(id: number, completedAt: Date): Promise<Enrollment | null> {
    try {
      const enrollment = await prisma.enrollment.update({
        where: { id },
        data: { completedAt },
      })

      return this.mapToEnrollment(enrollment)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null
      }
      throw error
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.enrollment.delete({
        where: { id },
      })
      return true
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return false
      }
      throw error
    }
  }

  private mapToEnrollment(enrollment: any): Enrollment {
    return {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    }
  }
}
