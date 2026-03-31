import type { FastifyInstance } from 'fastify'
import type { DashboardController } from '../controllers/dashboard-controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import {
  errorResponseSchema,
  successResponse,
  dashboardResponseSchema,
} from '../dto/openapi-schemas.js'

export async function dashboardRoutes(
  app: FastifyInstance,
  controller: DashboardController,
): Promise<void> {
  app.get(
    '/me/dashboard',
    {
      schema: {
        tags: ['Dashboard'],
        summary: 'Get learner dashboard',
        description: 'Returns a summary of courses in progress, completed courses, and certificates for the authenticated learner.',
        security: [{ bearerAuth: [] }],
        response: {
          200: successResponse(dashboardResponseSchema),
          401: errorResponseSchema,
        },
      },
      preHandler: [authMiddleware],
    },
    controller.getDashboard.bind(controller),
  )
}
