import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardController } from '../../../src/controllers/dashboard-controller.js'
import type { DashboardService } from '../../../src/services/dashboard-service.js'
import { createMockRequest, createMockReply } from '../../helpers/fastify-mocks.js'

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function createMockDashboardService(): DashboardService {
  return {
    getDashboard: vi.fn(),
  } as unknown as DashboardService
}

describe('DashboardController', () => {
  let controller: DashboardController
  let mockService: DashboardService

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = createMockDashboardService()
    controller = new DashboardController(mockService)
  })

  describe('getDashboard', () => {
    it('should return 200 with dashboard data when user is authenticated', async () => {
      const dashboardData = {
        inProgress: [],
        completed: [],
        certificates: [],
      }
      vi.mocked(mockService.getDashboard).mockResolvedValue(dashboardData)

      const request = createMockRequest({
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.getDashboard(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(reply.send).toHaveBeenCalledWith({
        data: dashboardData,
        requestId: 'test-req-id',
      })
      expect(mockService.getDashboard).toHaveBeenCalledWith(1)
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest()
      const reply = createMockReply()

      await controller.getDashboard(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        }),
      )
    })

    it('should log dashboard.fetched domain event', async () => {
      vi.mocked(mockService.getDashboard).mockResolvedValue({
        inProgress: [],
        completed: [],
        certificates: [],
      })

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        user: { id: 1, email: 'test@test.com', role: 'learner' },
      })
      const reply = createMockReply()

      await controller.getDashboard(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'test-req-id', userId: 1 }),
        'dashboard.fetched',
      )
    })
  })
})
