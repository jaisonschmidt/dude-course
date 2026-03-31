import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfirmModal } from '../ConfirmModal'

describe('ConfirmModal', () => {
  const onClose = vi.fn()
  const onConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar título e mensagem', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Deletar"
        message="Confirma exclusão?"
      />,
    )
    expect(screen.getByText('Deletar')).toBeInTheDocument()
    expect(screen.getByText('Confirma exclusão?')).toBeInTheDocument()
  })

  it('não deve renderizar quando fechado', () => {
    render(
      <ConfirmModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Deletar"
        message="Confirma?"
      />,
    )
    expect(screen.queryByText('Deletar')).not.toBeInTheDocument()
  })

  it('deve chamar onClose ao clicar Cancelar', async () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Deletar"
        message="Confirma?"
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onConfirm ao clicar Confirmar', async () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Deletar"
        message="Confirma?"
        confirmLabel="Sim, deletar"
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /sim, deletar/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('deve exibir loading no botão de confirmar', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Deletar"
        message="Confirma?"
        loading={true}
      />,
    )
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })
})
