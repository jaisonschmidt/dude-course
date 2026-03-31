import { apiRequest } from './api'
import type { Lesson } from './types/course'

export interface CreateLessonInput {
  title: string
  description?: string
  youtubeUrl: string
  position: number
}

export interface UpdateLessonInput {
  title?: string
  description?: string
  youtubeUrl?: string
  position?: number
}

export interface ReorderItem {
  lessonId: number
  position: number
}

/**
 * Cria uma nova aula em um curso.
 */
export async function addLesson(
  courseId: number,
  input: CreateLessonInput,
): Promise<Lesson> {
  const { data } = await apiRequest<Lesson>(
    `/courses/${courseId}/lessons`,
    { method: 'POST', body: input },
  )
  return data
}

/**
 * Atualiza uma aula existente.
 */
export async function updateLesson(
  courseId: number,
  lessonId: number,
  input: UpdateLessonInput,
): Promise<Lesson> {
  const { data } = await apiRequest<Lesson>(
    `/courses/${courseId}/lessons/${lessonId}`,
    { method: 'PUT', body: input },
  )
  return data
}

/**
 * Remove uma aula de um curso.
 */
export async function deleteLesson(
  courseId: number,
  lessonId: number,
): Promise<void> {
  await apiRequest(`/courses/${courseId}/lessons/${lessonId}`, {
    method: 'DELETE',
  })
}

/**
 * Reordena as aulas de um curso.
 */
export async function reorderLessons(
  courseId: number,
  positions: ReorderItem[],
): Promise<Lesson[]> {
  const { data } = await apiRequest<Lesson[]>(
    `/courses/${courseId}/lessons/reorder`,
    { method: 'PATCH', body: { lessons: positions } },
  )
  return data
}
