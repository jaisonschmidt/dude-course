'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/components/auth/LoginForm'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [successMessage] = useState(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('registered') === 'true'
      ? 'Conta criada com sucesso! Faça login para continuar.'
      : null
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="mb-6 text-2xl font-bold">Entrar</h1>

        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700" role="status">
            {successMessage}
          </div>
        )}

        <LoginForm onSuccess={() => router.push('/dashboard')} />
      </div>
    </div>
  )
}
