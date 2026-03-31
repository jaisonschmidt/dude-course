import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addLesson, updateLesson, deleteLesson, reorderLessons } from '../admin-lesson-service'

const mockApiRequest = vi.fn()
vi.mock('../api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

describe('adminLessonService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('addLesson deve chamar POST /courses/:id/lessons', async () => {
    const mockLesson = { id: 1, title: 'Aula 1', position: 1 }
    mockApiRequest.mockResolvedValueOnce({ data: mockLesson, requestId: 'r1' })

    const result = await addLesson(5, {
      title: 'Aula 1',
      youtubeUrl: 'https://youtube.com/watch?v=abc',
      position: 1,
    })

    expect(mockApiRequest).toHaveBeenCalledWith('/courses/5/lessons', {
      method: 'POST',
      body: { title: 'Aula 1', youtubeUrl: 'https://youtube.com/watch?v=abc', position: 1 },
    })
    expect(result).toEqual(mockLesson)
  })

  it('updateLesson deve chamar PUT /courses/:id/lessons/:lessonId', async () => {
    const mockLesson = { id: 2, title: 'Aula atualizada' }
    mockApiRequest.mockResolvedValueOnce({ data: mockLesson, requestId: 'r2' })

    await updateLesson(5, 2, { title: 'Aula atualizada' })

    expect(mockApiRequest).toHaveBeenCalledWith('/courses/5/lessons/2', {
      method: 'PUT',
      body: { title: 'Aula atualizada' },
    })
  })

  it('deleteLesson deve chamar DELETE /courses/:id/lessons/:lessonId', async () => {
    mockApiRequest.mockResolvedValueOnce({ data: null, requestId: 'r3' })

    await deleteLesson(5, 2)

    expect(mockApiRequest).toHaveBeenCalledWith('/courses/5/lessons/2', { method: 'DELETE' })
  })

  it('reorderLessons deve chamar PATCH /courses/:id/lessons/reorder', async () => {
    const mockLessons = [
      { id: 1, position: 2 },
      { id: 2, position: 1 },
    ]
    mockApiRequest.mockResolvedValueOnce({ data: mockLessons, requestId: 'r4' })

    await reorderLessons(5, [
      { lessonId: 2, position: 1 },
      { lessonId: 1, position: 2 },
    ])

    expect(mockApiRequest).toHaveBeenCalledWith('/courses/5/lessons/reorder', {
      method: 'PATCH',
      body: {
        lessons: [
          { lessonId: 2, position: 1 },
          { lessonId: 1, position: 2 },
        ],
      },
    })
  })
})
