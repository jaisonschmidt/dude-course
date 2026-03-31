import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const { default: GlobalError } = await import('../../app/error')

describe('GlobalError (Error Boundary)', () => {
  it('deve exibir mensagem de erro amigável', () => {
    const error = new Error('Test error')
    render(<GlobalError error={error} reset={vi.fn()} />)
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
  })

  it('deve ter botão de retry', () => {
    const error = new Error('Test')
    render(<GlobalError error={error} reset={vi.fn()} />)
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
  })

  it('deve chamar reset ao clicar retry', async () => {
    const reset = vi.fn()
    const error = new Error('Test')
    render(<GlobalError error={error} reset={reset} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('deve ter link para homepage', () => {
    const error = new Error('Test')
    render(<GlobalError error={error} reset={vi.fn()} />)
    const link = screen.getByRole('link', { name: /ir para o início/i })
    expect(link).toHaveAttribute('href', '/')
  })
})
