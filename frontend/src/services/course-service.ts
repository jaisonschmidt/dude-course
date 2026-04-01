import { apiRequest } from './api'
import type { Course, CourseWithLessons, PaginationMeta } from './types/course'

interface ListCoursesResponse {
  data: Course[]
  meta: PaginationMeta
  requestId: string
}

/**
 * Lista cursos publicados do catálogo público.
 */
export async function listCourses(
  page = 1,
  pageSize = 20,
): Promise<{ courses: Course[]; meta: PaginationMeta }> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  const cacheOptions =
    process.env.NODE_ENV === 'production'
      ? { next: { revalidate: 60 } }
      : { cache: 'no-store' as const }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/courses?${params}`,
    cacheOptions,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch courses: ${response.status}`)
  }

  const json: ListCoursesResponse = await response.json()
  return { courses: json.data, meta: json.meta }
}

/**
 * Retorna o detalhe de um curso com suas lessons.
 */
export async function getCourse(id: number): Promise<CourseWithLessons> {
  const { data } = await apiRequest<CourseWithLessons>(`/courses/${id}`)
  return data
}
