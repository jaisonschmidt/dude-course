import type { Certificate, CreateCertificateData } from '../models/certificate.js'

export interface ICertificateRepository {
  findByUserAndCourse(userId: number, courseId: number): Promise<Certificate | null>
  findByCode(code: string): Promise<Certificate | null>
  create(data: CreateCertificateData): Promise<Certificate>
}

export class PrismaCertificateRepository implements ICertificateRepository {
  async findByUserAndCourse(_userId: number, _courseId: number): Promise<Certificate | null> {
    // TODO: implement with Prisma
    throw new Error('PrismaCertificateRepository.findByUserAndCourse not implemented')
  }

  async findByCode(_code: string): Promise<Certificate | null> {
    // TODO: implement with Prisma
    throw new Error('PrismaCertificateRepository.findByCode not implemented')
  }

  async create(_data: CreateCertificateData): Promise<Certificate> {
    // TODO: implement with Prisma
    throw new Error('PrismaCertificateRepository.create not implemented')
  }
}
