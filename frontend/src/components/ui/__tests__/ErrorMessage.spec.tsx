import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorMessage } from '../ErrorMessage'

describe('ErrorMessage', () => {
  it('deve renderizar mensagem de erro', () => {
    render(<ErrorMessage message="Algo deu errado" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado')
  })

  it('deve exibir requestId quando fornecido', () => {
    render(<ErrorMessage message="Erro" requestId="req-123" />)
    expect(screen.getByText(/req-123/)).toBeInTheDocument()
  })

  it('deve não exibir requestId quando não fornecido', () => {
    render(<ErrorMessage message="Erro" />)
    expect(screen.queryByText(/ID da requisição/)).not.toBeInTheDocument()
  })

  it('deve exibir botão de retry quando onRetry fornecido', () => {
    render(<ErrorMessage message="Erro" onRetry={vi.fn()} />)
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  it('deve chamar onRetry ao clicar no botão', async () => {
    const onRetry = vi.fn()
    render(<ErrorMessage message="Erro" onRetry={onRetry} />)

    const user = userEvent.setup()
    await user.click(screen.getByText('Tentar novamente'))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
