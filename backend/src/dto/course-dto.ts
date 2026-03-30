import { z } from 'zod'

// ── Query Params ──────────────────────────────────────────────

export const ListCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type ListCoursesQueryDto = z.infer<typeof ListCoursesQuerySchema>

// ── Path Params ───────────────────────────────────────────────

export const CourseIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export type CourseIdParamDto = z.infer<typeof CourseIdParamSchema>

// ── Response DTOs ─────────────────────────────────────────────

export interface CourseResponseDto {
  id: number
  title: string
  description: string
  thumbnailUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface LessonResponseDto {
  id: number
  title: string
  description: string | null
  youtubeUrl: string
  position: number
}

export interface CourseDetailResponseDto extends CourseResponseDto {
  lessons: LessonResponseDto[]
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}
