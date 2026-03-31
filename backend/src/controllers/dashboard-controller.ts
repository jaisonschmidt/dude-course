import type { FastifyRequest, FastifyReply } from 'fastify'
import type { DashboardService } from '../services/dashboard-service.js'
import { logger } from '../utils/logger.js'

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async getDashboard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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

    const dashboard = await this.dashboardService.getDashboard(userId)

    logger.info(
      { requestId: request.id, userId },
      'dashboard.fetched',
    )

    return reply.status(200).send({ data: dashboard, requestId: request.id })
  }
}
