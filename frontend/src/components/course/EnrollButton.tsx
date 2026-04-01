'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface EnrollButtonProps {
  isEnrolled: boolean
  onEnroll: () => Promise<void>
}

export function EnrollButton({ isEnrolled, onEnroll }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onEnroll()
    } finally {
      setLoading(false)
    }
  }

  if (isEnrolled) {
    return (
      <Button variant="secondary" disabled data-testid="enroll-button-enrolled">
        ✓ Matriculado
      </Button>
    )
  }

  return (
    <Button onClick={handleClick} loading={loading} data-testid="enroll-button">
      Iniciar Curso
    </Button>
  )
}
