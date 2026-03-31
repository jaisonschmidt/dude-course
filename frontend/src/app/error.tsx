'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for observability
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-6xl">⚠️</div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Algo deu errado
      </h1>
      <p className="mb-6 max-w-md text-gray-600">
        Ocorreu um erro inesperado. Tente novamente ou volte para a página
        inicial.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <Link href="/">
          <Button variant="secondary">Ir para o início</Button>
        </Link>
      </div>
    </div>
  )
}
