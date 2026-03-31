import { z } from 'zod'

export const CertificateCourseIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
})
export type CertificateCourseIdParamDto = z.infer<typeof CertificateCourseIdParamSchema>

export interface CertificateResponseDto {
  id: number
  certificateCode: string
  issuedAt: string
  courseName: string
  learnerName: string
}
