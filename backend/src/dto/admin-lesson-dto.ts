import { z } from 'zod'

// ── YouTube URL Validation ────────────────────────────────────

/**
 * Regex for valid YouTube URLs.
 * Accepts:
 *   - https://youtube.com/watch?v=VIDEO_ID
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 */
const YOUTUBE_URL_REGEX =
  /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/

// ── Path Params ───────────────────────────────────────────────

export const AdminLessonCourseIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export type AdminLessonCourseIdParamDto = z.infer<typeof AdminLessonCourseIdParamSchema>

export const AdminLessonParamSchema = z.object({
  id: z.coerce.number().int().min(1),
  lessonId: z.coerce.number().int().min(1),
})

export type AdminLessonParamDto = z.infer<typeof AdminLessonParamSchema>

// ── Request Bodies ────────────────────────────────────────────

export const CreateLessonBodySchema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().optional(),
  youtubeUrl: z.string().url().regex(YOUTUBE_URL_REGEX, 'Must be a valid YouTube URL'),
  position: z.number().int().min(1),
})

export type CreateLessonBodyDto = z.infer<typeof CreateLessonBodySchema>

export const UpdateLessonBodySchema = z.object({
  title: z.string().min(1).max(180).optional(),
  description: z.string().nullish(),
  youtubeUrl: z
    .string()
    .url()
    .regex(YOUTUBE_URL_REGEX, 'Must be a valid YouTube URL')
    .optional(),
  position: z.number().int().min(1).optional(),
})

export type UpdateLessonBodyDto = z.infer<typeof UpdateLessonBodySchema>

export const ReorderLessonsBodySchema = z.object({
  lessons: z
    .array(
      z.object({
        lessonId: z.number().int().min(1),
        position: z.number().int().min(1),
      }),
    )
    .min(1),
})

export type ReorderLessonsBodyDto = z.infer<typeof ReorderLessonsBodySchema>

// ── Response DTOs ─────────────────────────────────────────────

export interface AdminLessonResponseDto {
  id: number
  courseId: number
  title: string
  description: string | null
  youtubeUrl: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface ReorderLessonResponseDto {
  id: number
  courseId: number
  title: string
  position: number
}
