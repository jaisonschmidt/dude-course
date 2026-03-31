import { apiRequest } from './api'
import type { Course, CourseWithLessons, PaginationMeta } from './types/course'

export interface CreateCourseInput {
  title: string
  description: string
  thumbnailUrl?: string
}

export interface UpdateCourseInput {
  title?: string
  description?: string
  thumbnailUrl?: string | null
}

/**
 * Lista todos os cursos (admin vê todos os status).
 */
export async function listAllCourses(
  page = 1,
  pageSize = 100,
): Promise<{ courses: Course[]; meta: PaginationMeta }> {
  const { data, ...rest } = await apiRequest<Course[]>(
    `/courses?page=${page}&pageSize=${pageSize}`,
  )
  return {
    courses: data,
    meta: (rest as unknown as { meta: PaginationMeta }).meta ?? {
      page,
      pageSize,
      totalItems: data.length,
      totalPages: 1,
    },
  }
}

/**
 * Cria um novo curso (status: draft).
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const { data } = await apiRequest<Course>('/courses', {
    method: 'POST',
    body: input,
  })
  return data
}

/**
 * Atualiza um curso existente.
 */
export async function updateCourse(
  id: number,
  input: UpdateCourseInput,
): Promise<Course> {
  const { data } = await apiRequest<Course>(`/courses/${id}`, {
    method: 'PUT',
    body: input,
  })
  return data
}

/**
 * Publica um curso.
 */
export async function publishCourse(id: number): Promise<Course> {
  const { data } = await apiRequest<Course>(`/courses/${id}/publish`, {
    method: 'PATCH',
  })
  return data
}

/**
 * Despublica um curso.
 */
export async function unpublishCourse(id: number): Promise<Course> {
  const { data } = await apiRequest<Course>(`/courses/${id}/unpublish`, {
    method: 'PATCH',
  })
  return data
}

/**
 * Remove um curso.
 */
export async function deleteCourse(id: number): Promise<void> {
  await apiRequest(`/courses/${id}`, { method: 'DELETE' })
}

/**
 * Retorna um curso com lessons (para edição admin).
 */
export async function getAdminCourse(id: number): Promise<CourseWithLessons> {
  const { data } = await apiRequest<CourseWithLessons>(`/courses/${id}`)
  return data
}
