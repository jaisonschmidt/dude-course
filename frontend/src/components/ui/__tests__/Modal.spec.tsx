import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from '../Modal'

describe('Modal', () => {
  it('deve não renderizar quando isOpen=false', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Test">Conteúdo</Modal>)
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument()
  })

  it('deve renderizar quando isOpen=true', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Meu Modal">Conteúdo</Modal>)
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
    expect(screen.getByText('Meu Modal')).toBeInTheDocument()
  })

  it('deve chamar onClose ao clicar no botão fechar', async () => {
    const onClose = vi.fn()
    render(<Modal isOpen={true} onClose={onClose} title="Test">Conteúdo</Modal>)

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Fechar'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onClose ao pressionar Escape', async () => {
    const onClose = vi.fn()
    render(<Modal isOpen={true} onClose={onClose} title="Test">Conteúdo</Modal>)

    const user = userEvent.setup()
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('deve ter role=dialog e aria-modal=true', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Test">Conteúdo</Modal>)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
