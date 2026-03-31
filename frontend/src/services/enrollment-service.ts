import { apiRequest } from './api'

export interface Enrollment {
  id: number
  userId: number
  courseId: number
  startedAt: string
}

export interface LessonProgress {
  id: number
  userId: number
  courseId: number
  lessonId: number
  completedAt: string
}

/**
 * Matricula o learner autenticado em um curso.
 * Operação idempotente: retorna enrollment existente se já matriculado.
 */
export async function enrollInCourse(courseId: number): Promise<Enrollment> {
  const { data } = await apiRequest<Enrollment>(
    `/courses/${courseId}/enrollments`,
    { method: 'POST' },
  )
  return data
}

/**
 * Marca uma aula como concluída.
 * Operação idempotente: retorna progresso existente se já concluída.
 */
export async function markLessonComplete(
  courseId: number,
  lessonId: number,
): Promise<LessonProgress> {
  const { data } = await apiRequest<LessonProgress>(
    `/courses/${courseId}/lessons/${lessonId}/progress`,
    { method: 'POST' },
  )
  return data
}
