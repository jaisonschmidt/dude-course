import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('deve renderizar texto', () => {
    render(<Badge variant="draft">Rascunho</Badge>)
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('deve aplicar classes para variante draft', () => {
    render(<Badge variant="draft">Draft</Badge>)
    expect(screen.getByText('Draft').className).toContain('bg-gray-100')
  })

  it('deve aplicar classes para variante published', () => {
    render(<Badge variant="published">Publicado</Badge>)
    expect(screen.getByText('Publicado').className).toContain('bg-green-100')
  })

  it('deve aplicar classes para variante unpublished', () => {
    render(<Badge variant="unpublished">Despublicado</Badge>)
    expect(screen.getByText('Despublicado').className).toContain('bg-yellow-100')
  })

  it('deve aplicar classes para variante info', () => {
    render(<Badge variant="info">Info</Badge>)
    expect(screen.getByText('Info').className).toContain('bg-blue-100')
  })

  it('deve aceitar className customizado', () => {
    render(<Badge variant="draft" className="custom">Test</Badge>)
    expect(screen.getByText('Test').className).toContain('custom')
  })
})
