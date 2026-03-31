import { beforeEach, describe, expect, it, vi } from 'vitest'
import { enrollInCourse, markLessonComplete } from '../enrollment-service'

const mockApiRequest = vi.fn()
vi.mock('../api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

describe('enrollmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('enrollInCourse', () => {
    it('deve chamar apiRequest com POST e path correto', async () => {
      const mockEnrollment = { id: 1, userId: 42, courseId: 1, startedAt: '2026-01-01T00:00:00.000Z' }
      mockApiRequest.mockResolvedValueOnce({ data: mockEnrollment, requestId: 'req-1' })

      const result = await enrollInCourse(1)

      expect(mockApiRequest).toHaveBeenCalledWith('/courses/1/enrollments', { method: 'POST' })
      expect(result).toEqual(mockEnrollment)
    })
  })

  describe('markLessonComplete', () => {
    it('deve chamar apiRequest com POST e path correto', async () => {
      const mockProgress = { id: 1, userId: 42, courseId: 1, lessonId: 5, completedAt: '2026-01-01T00:00:00.000Z' }
      mockApiRequest.mockResolvedValueOnce({ data: mockProgress, requestId: 'req-2' })

      const result = await markLessonComplete(1, 5)

      expect(mockApiRequest).toHaveBeenCalledWith('/courses/1/lessons/5/progress', { method: 'POST' })
      expect(result).toEqual(mockProgress)
    })
  })
})
