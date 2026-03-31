import type { FastifyInstance } from 'fastify'
import type { CertificateController } from '../controllers/certificate-controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { CertificateCourseIdParamSchema } from '../dto/certificate-dto.js'
import { zodToJsonSchema } from '../utils/zod-to-json-schema.js'
import {
  errorResponseSchema,
  successResponse,
  certificateResponseSchema,
} from '../dto/openapi-schemas.js'

export async function certificateRoutes(
  app: FastifyInstance,
  controller: CertificateController,
): Promise<void> {
  app.post(
    '/courses/:id/certificate',
    {
      schema: {
        tags: ['Certificates'],
        summary: 'Generate or get certificate',
        description: 'Generates a certificate for a completed course or returns the existing one. Idempotent operation.',
        security: [{ bearerAuth: [] }],
        params: zodToJsonSchema(CertificateCourseIdParamSchema),
        response: {
          200: successResponse(certificateResponseSchema),
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [authMiddleware],
    },
    controller.generateOrGet.bind(controller),
  )
}
