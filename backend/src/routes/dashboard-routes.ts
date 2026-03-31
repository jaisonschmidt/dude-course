import type { FastifyInstance } from 'fastify'
import type { DashboardController } from '../controllers/dashboard-controller.js'
import { authMiddleware } from '../middlewares/auth.js'

export async function dashboardRoutes(
  app: FastifyInstance,
  controller: DashboardController,
): Promise<void> {
  app.get(
    '/me/dashboard',
    { preHandler: [authMiddleware] },
    controller.getDashboard.bind(controller),
  )
}
