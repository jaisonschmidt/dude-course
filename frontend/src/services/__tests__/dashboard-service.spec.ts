import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDashboard } from '../dashboard-service'

const mockApiRequest = vi.fn()
vi.mock('../api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboard', () => {
    it('deve chamar GET /me/dashboard', async () => {
      const mockDashboard = {
        inProgress: [],
        completed: [],
        certificates: [],
      }
      mockApiRequest.mockResolvedValueOnce({ data: mockDashboard, requestId: 'req-1' })

      const result = await getDashboard()

      expect(mockApiRequest).toHaveBeenCalledWith('/me/dashboard')
      expect(result).toEqual(mockDashboard)
    })

    it('deve retornar dados completos do dashboard', async () => {
      const mockDashboard = {
        inProgress: [
          { courseId: 1, title: 'Node.js', thumbnailUrl: null, progress: { completed: 3, total: 10, percentage: 30 } },
        ],
        completed: [
          { courseId: 2, title: 'TypeScript', completedAt: '2026-01-20T14:00:00.000Z' },
        ],
        certificates: [
          { courseId: 2, title: 'TypeScript', certificateCode: 'abc-123', issuedAt: '2026-01-20T14:05:00.000Z' },
        ],
      }
      mockApiRequest.mockResolvedValueOnce({ data: mockDashboard, requestId: 'req-2' })

      const result = await getDashboard()

      expect(result.inProgress).toHaveLength(1)
      expect(result.completed).toHaveLength(1)
      expect(result.certificates).toHaveLength(1)
    })
  })
})
