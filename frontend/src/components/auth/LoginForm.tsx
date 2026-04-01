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

const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth()
  const [apiError, setApiError] = useState<{ message: string; requestId?: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null)
    try {
      await login(data.email, data.password)
      onSuccess()
    } catch (error) {
      if (error instanceof AppError) {
        const message =
          error.code === 'UNAUTHORIZED'
            ? 'Email ou senha inválidos'
            : error.message
        setApiError({ message, requestId: error.requestId })
      } else {
        setApiError({ message: 'Erro inesperado. Tente novamente mais tarde.' })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate data-testid="login-form">
      {apiError && (
        <div data-testid="login-error-message">
          <ErrorMessage
            message={apiError.message}
            requestId={apiError.requestId}
            onRetry={() => setApiError(null)}
          />
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="seu@email.com"
        error={errors.email?.message}
        disabled={isSubmitting}
        data-testid="login-email-input"
        {...register('email')}
      />

      <Input
        label="Senha"
        type="password"
        placeholder="Sua senha"
        error={errors.password?.message}
        disabled={isSubmitting}
        data-testid="login-password-input"
        {...register('password')}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2 w-full" data-testid="login-submit-button">
        Entrar
      </Button>

      <p className="text-center text-sm text-gray-600">
        Não tem conta?{' '}
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700" data-testid="login-register-link">
          Cadastre-se
        </Link>
      </p>
    </form>
  )
}
