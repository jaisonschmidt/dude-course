import type { Certificate, CreateCertificateData } from '../models/certificate.js'
import { prisma } from 'database'

export interface ICertificateRepository {
  create(data: CreateCertificateData): Promise<Certificate>
  findById(id: number): Promise<Certificate | null>
  findByUserAndCourse(userId: number, courseId: number): Promise<Certificate | null>
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
    } catch {
      return false
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
