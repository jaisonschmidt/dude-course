import type { FastifyRequest, FastifyReply } from 'fastify'
import type { CertificateService } from '../services/certificate-service.js'
import { CertificateCourseIdParamSchema } from '../dto/certificate-dto.js'
import type { CertificateResponseDto } from '../dto/certificate-dto.js'
import { logger } from '../utils/logger.js'

export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  async generateOrGet(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = CertificateCourseIdParamSchema.parse(request.params)

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authentication token',
          requestId: request.id,
        },
      })
    }

    const userId = request.user.id

    const result = await this.certificateService.generateOrGet(userId, params.id)

    const data: CertificateResponseDto = {
      id: result.certificate.id,
      certificateCode: result.certificate.certificateCode,
      issuedAt: result.certificate.issuedAt.toISOString(),
      courseName: result.courseName,
      learnerName: result.learnerName,
    }

    if (result.isNew) {
      logger.info(
        { requestId: request.id, userId, courseId: params.id, certificateCode: result.certificate.certificateCode },
        'certificate.issued',
      )
    }

    return reply.status(200).send({ data, requestId: request.id })
  }
}
