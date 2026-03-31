import type { FastifyRequest, FastifyReply } from 'fastify'
import { logger } from '../utils/logger.js'

/**
 * Admin guard middleware.
 *
 * Must be used AFTER authMiddleware so that `request.user` is populated.
 * Returns 403 FORBIDDEN when the authenticated user is not an admin.
 * Defensively returns 401 if `request.user` is missing (auth middleware
 * should have already rejected, but be safe).
 */
export async function adminGuardMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!request.user) {
    logger.warn(
      { requestId: request.id },
      'Admin guard: request.user not set (auth middleware may not have run)',
    )
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authentication token',
        requestId: request.id,
      },
    })
  }

  if (request.user.role !== 'admin') {
    logger.warn(
      { requestId: request.id, userId: request.user.id, role: request.user.role },
      'Admin guard: non-admin user attempted admin action',
    )
    return reply.status(403).send({
      error: {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        requestId: request.id,
      },
    })
  }
}
