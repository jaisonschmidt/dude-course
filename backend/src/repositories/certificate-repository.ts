import type { Certificate, CreateCertificateData } from '../models/certificate.js'
import { prisma } from 'database'
import { isRecordNotFoundError } from '../utils/prisma-errors.js'

export interface ICertificateRepository {
  create(data: CreateCertificateData): Promise<Certificate>
  findById(id: number): Promise<Certificate | null>
  findByUserAndCourse(userId: number, courseId: number): Promise<Certificate | null>
  findByUserId(userId: number): Promise<Certificate[]>
  findByCertificateCode(code: string): Promise<Certificate | null>
  delete(id: number): Promise<boolean>
}

export class PrismaCertificateRepository implements ICertificateRepository {
  async create(data: CreateCertificateData): Promise<Certificate> {
    const certificate = await prisma.certificate.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        certificateCode: data.certificateCode,
      },
    })

    return this.mapToCertificate(certificate)
  }

  async findById(id: number): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findUnique({
      where: { id },
    })

    if (!certificate) {
      return null
    }

    return this.mapToCertificate(certificate)
  }

  async findByUserAndCourse(userId: number, courseId: number): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    })

    if (!certificate) {
      return null
    }

    return this.mapToCertificate(certificate)
  }

  async findByUserId(userId: number): Promise<Certificate[]> {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
    })

    return certificates.map((c) => this.mapToCertificate(c))
  }

  async findByCertificateCode(code: string): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: code },
    })

    if (!certificate) {
      return null
    }

    return this.mapToCertificate(certificate)
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.certificate.delete({
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

  private mapToCertificate(certificate: any): Certificate {
    return {
      id: certificate.id,
      userId: certificate.userId,
      courseId: certificate.courseId,
      certificateCode: certificate.certificateCode,
      issuedAt: certificate.issuedAt,
      createdAt: certificate.createdAt,
      updatedAt: certificate.updatedAt,
    }
  }
}
