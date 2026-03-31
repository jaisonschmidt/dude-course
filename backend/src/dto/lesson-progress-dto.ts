import { z } from 'zod'

export const LessonProgressParamsSchema = z.object({
  courseId: z.coerce.number().int().min(1),
  lessonId: z.coerce.number().int().min(1),
})
export type LessonProgressParamsDto = z.infer<typeof LessonProgressParamsSchema>

export interface LessonProgressResponseDto {
  id: number
  userId: number
  courseId: number
  lessonId: number
  completedAt: string
}
