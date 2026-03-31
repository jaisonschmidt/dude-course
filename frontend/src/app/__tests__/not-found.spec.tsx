import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

// Must import after mock
const { default: NotFound } = await import('../../app/not-found')

describe('NotFound (404)', () => {
  it('deve exibir título 404', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('deve exibir mensagem amigável', () => {
    render(<NotFound />)
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
  })

  it('deve ter link para homepage', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: /voltar para o início/i })
    expect(link).toHaveAttribute('href', '/')
  })
})
