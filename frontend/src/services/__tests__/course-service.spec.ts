import { describe, expect, it, vi, beforeEach } from 'vitest'
import { listCourses, getCourse } from '../course-service'

const mockApiRequest = vi.fn()
vi.mock('../api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

describe('courseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('listCourses', () => {
    it('deve chamar fetch com parâmetros corretos', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: [{ id: 1, title: 'Test' }],
          meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
          requestId: 'req-1',
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await listCourses(1, 20)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/courses?page=1&pageSize=20'),
        expect.objectContaining({ cache: 'no-store' }),
      )
      expect(result.courses).toHaveLength(1)
      expect(result.meta.totalPages).toBe(1)
    })

    it('deve lançar erro quando response não é ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      await expect(listCourses()).rejects.toThrow('Failed to fetch courses: 500')
    })

    it('deve usar valores padrão page=1 pageSize=20', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: [],
          meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
          requestId: 'req-1',
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      await listCourses()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1&pageSize=20'),
        expect.any(Object),
      )
    })
  })

  describe('getCourse', () => {
    it('deve chamar apiRequest com path correto', async () => {
      const mockCourse = { id: 1, title: 'Test', lessons: [] }
      mockApiRequest.mockResolvedValueOnce({ data: mockCourse, requestId: 'req-1' })

      const result = await getCourse(1)

      expect(mockApiRequest).toHaveBeenCalledWith('/courses/1')
      expect(result).toEqual(mockCourse)
    })
  })
})
