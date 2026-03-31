import { z } from 'zod'

export const EnrollmentCourseIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
})
export type EnrollmentCourseIdParamDto = z.infer<typeof EnrollmentCourseIdParamSchema>

export interface EnrollmentResponseDto {
  id: number
  userId: number
  courseId: number
  startedAt: string
}
