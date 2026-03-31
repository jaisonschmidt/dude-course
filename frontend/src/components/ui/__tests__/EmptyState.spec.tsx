import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('deve renderizar mensagem', () => {
    render(<EmptyState message="Nenhum item encontrado" />)
    expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument()
  })

  it('deve renderizar ícone padrão', () => {
    render(<EmptyState message="Vazio" />)
    expect(screen.getByText('📭')).toBeInTheDocument()
  })

  it('deve renderizar ícone customizado', () => {
    render(<EmptyState message="Vazio" icon="🔍" />)
    expect(screen.getByText('🔍')).toBeInTheDocument()
  })

  it('deve renderizar botão de ação quando fornecido', () => {
    render(<EmptyState message="Vazio" actionLabel="Criar novo" onAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: /criar novo/i })).toBeInTheDocument()
  })

  it('deve chamar onAction ao clicar no botão', async () => {
    const onAction = vi.fn()
    render(<EmptyState message="Vazio" actionLabel="Criar" onAction={onAction} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /criar/i }))

    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('deve não renderizar botão sem actionLabel', () => {
    render(<EmptyState message="Vazio" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
