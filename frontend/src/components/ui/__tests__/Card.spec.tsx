import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from '../Card'

describe('Card', () => {
  it('deve renderizar children', () => {
    render(<Card>Conteúdo do card</Card>)
    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument()
  })

  it('deve renderizar título quando fornecido', () => {
    render(<Card title="Meu Card">Conteúdo</Card>)
    expect(screen.getByText('Meu Card')).toBeInTheDocument()
  })

  it('deve não renderizar título quando não fornecido', () => {
    render(<Card>Conteúdo</Card>)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('deve aceitar className customizado', () => {
    const { container } = render(<Card className="custom-class">Conteúdo</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
