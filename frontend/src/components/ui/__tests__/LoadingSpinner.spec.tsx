import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('deve renderizar com role=status', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('deve ter texto acessível "Carregando..."', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve aplicar classes de tamanho sm', () => {
    render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status').className).toContain('h-4')
  })

  it('deve aplicar classes de tamanho md (default)', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status').className).toContain('h-8')
  })

  it('deve aplicar classes de tamanho lg', () => {
    render(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status').className).toContain('h-12')
  })
})
