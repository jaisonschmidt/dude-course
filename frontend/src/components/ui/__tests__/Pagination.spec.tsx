import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '../Pagination'

describe('Pagination', () => {
  it('deve não renderizar quando totalPages <= 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve renderizar informação de página', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument()
  })

  it('deve desabilitar botão anterior na primeira página', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
  })

  it('deve desabilitar botão próximo na última página', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Próxima página')).toBeDisabled()
  })

  it('deve chamar onPageChange com página anterior', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Página anterior'))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('deve chamar onPageChange com próxima página', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Próxima página'))

    expect(onPageChange).toHaveBeenCalledWith(4)
  })
})
