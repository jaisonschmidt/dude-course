'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { AppError } from '@/services/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerUser } = useAuth()
  const [apiError, setApiError] = useState<{ message: string; requestId?: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null)
    try {
      await registerUser(data.name, data.email, data.password)
      onSuccess()
    } catch (error) {
      if (error instanceof AppError) {
        const message =
          error.code === 'CONFLICT'
            ? 'Email já cadastrado'
            : error.message
        setApiError({ message, requestId: error.requestId })
      } else {
        setApiError({ message: 'Erro inesperado. Tente novamente mais tarde.' })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate data-testid="register-form">
      {apiError && (
        <div data-testid="register-error-message">
          <ErrorMessage
            message={apiError.message}
            requestId={apiError.requestId}
            onRetry={() => setApiError(null)}
          />
        </div>
      )}

      <Input
        label="Nome"
        type="text"
        placeholder="Seu nome completo"
        error={errors.name?.message}
        disabled={isSubmitting}
        data-testid="register-name-input"
        {...register('name')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="seu@email.com"
        error={errors.email?.message}
        disabled={isSubmitting}
        data-testid="register-email-input"
        {...register('email')}
      />

      <Input
        label="Senha"
        type="password"
        placeholder="Mínimo 8 caracteres"
        error={errors.password?.message}
        disabled={isSubmitting}
        data-testid="register-password-input"
        {...register('password')}
      />

      <Input
        label="Confirmar senha"
        type="password"
        placeholder="Repita a senha"
        error={errors.confirmPassword?.message}
        disabled={isSubmitting}
        data-testid="register-confirm-password-input"
        {...register('confirmPassword')}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2 w-full" data-testid="register-submit-button">
        Criar conta
      </Button>

      <p className="text-center text-sm text-gray-600">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700" data-testid="register-login-link">
          Faça login
        </Link>
      </p>
    </form>
  )
}
