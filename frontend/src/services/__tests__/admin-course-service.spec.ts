import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCourse,
  updateCourse,
  publishCourse,
  unpublishCourse,
  deleteCourse,
} from '../admin-course-service'

const mockApiRequest = vi.fn()
vi.mock('../api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

describe('adminCourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createCourse deve chamar POST /courses', async () => {
    const mockCourse = { id: 1, title: 'Novo', status: 'draft' }
    mockApiRequest.mockResolvedValueOnce({ data: mockCourse, requestId: 'r1' })

    const result = await createCourse({ title: 'Novo', description: 'Desc' })

    expect(mockApiRequest).toHaveBeenCalledWith('/courses', {
      method: 'POST',
      body: { title: 'Novo', description: 'Desc' },
    })
    expect(result).toEqual(mockCourse)
  })

  it('updateCourse deve chamar PUT /courses/:id', async () => {
    const mockCourse = { id: 1, title: 'Atualizado' }
    mockApiRequest.mockResolvedValueOnce({ data: mockCourse, requestId: 'r2' })

    await updateCourse(1, { title: 'Atualizado' })

    expect(mockApiRequest).toHaveBeenCalledWith('/courses/1', {
      method: 'PUT',
      body: { title: 'Atualizado' },
    })
  })

  it('publishCourse deve chamar PATCH /courses/:id/publish', async () => {
    mockApiRequest.mockResolvedValueOnce({ data: { id: 1, status: 'published' }, requestId: 'r3' })

    const result = await publishCourse(1)

    expect(mockApiRequest).toHaveBeenCalledWith('/courses/1/publish', { method: 'PATCH' })
    expect(result.status).toBe('published')
  })

  it('unpublishCourse deve chamar PATCH /courses/:id/unpublish', async () => {
    mockApiRequest.mockResolvedValueOnce({ data: { id: 1, status: 'unpublished' }, requestId: 'r4' })

    await unpublishCourse(1)

    expect(mockApiRequest).toHaveBeenCalledWith('/courses/1/unpublish', { method: 'PATCH' })
  })

  it('deleteCourse deve chamar DELETE /courses/:id', async () => {
    mockApiRequest.mockResolvedValueOnce({ data: null, requestId: 'r5' })

    await deleteCourse(1)

    expect(mockApiRequest).toHaveBeenCalledWith('/courses/1', { method: 'DELETE' })
  })
})
