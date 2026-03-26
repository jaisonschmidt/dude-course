import { z } from 'zod'

export const RegisterRequestSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
})

export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>

export const LoginRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(72),
})

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>

export interface AuthUserResponseDto {
  id: number
  name: string
  email: string
  role: string
}

export interface LoginResponseDto {
  accessToken: string
  expiresIn: string
  user: AuthUserResponseDto
}
