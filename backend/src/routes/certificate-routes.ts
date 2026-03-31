import type { FastifyInstance } from 'fastify'
import type { CertificateController } from '../controllers/certificate-controller.js'
import { authMiddleware } from '../middlewares/auth.js'

export async function certificateRoutes(
  app: FastifyInstance,
  controller: CertificateController,
): Promise<void> {
  app.post(
    '/courses/:id/certificate',
    { preHandler: [authMiddleware] },
    controller.generateOrGet.bind(controller),
  )
}
