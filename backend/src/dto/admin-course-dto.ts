import { z } from 'zod'

// ── Path Params ───────────────────────────────────────────────

export const AdminCourseIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export type AdminCourseIdParamDto = z.infer<typeof AdminCourseIdParamSchema>

// ── Request Bodies ────────────────────────────────────────────

export const CreateCourseBodySchema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().min(1),
  thumbnailUrl: z.string().url().optional(),
})

export type CreateCourseBodyDto = z.infer<typeof CreateCourseBodySchema>

export const UpdateCourseBodySchema = z.object({
  title: z.string().min(1).max(180).optional(),
  description: z.string().min(1).optional(),
  thumbnailUrl: z.string().url().nullish(),
})

export type UpdateCourseBodyDto = z.infer<typeof UpdateCourseBodySchema>

// ── Response DTOs ─────────────────────────────────────────────

export interface AdminCourseResponseDto {
  id: number
  title: string
  description: string
  thumbnailUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}
