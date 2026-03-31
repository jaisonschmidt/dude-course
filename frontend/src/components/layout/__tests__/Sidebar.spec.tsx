import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from '../Sidebar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/courses',
}))

describe('Sidebar', () => {
  it('deve renderizar título "Administração"', () => {
    render(<Sidebar isOpen={true} />)
    expect(screen.getByText('Administração')).toBeInTheDocument()
  })

  it('deve renderizar link de Cursos', () => {
    render(<Sidebar isOpen={true} />)
    expect(screen.getByText('Cursos')).toBeInTheDocument()
  })

  it('deve ter aria-label no aside', () => {
    render(<Sidebar isOpen={true} />)
    expect(screen.getByLabelText('Menu administrativo')).toBeInTheDocument()
  })

  it('deve chamar onClose ao clicar no overlay', async () => {
    const onClose = vi.fn()
    render(<Sidebar isOpen={true} onClose={onClose} />)

    const user = userEvent.setup()
    const overlay = document.querySelector('[aria-hidden="true"]')
    if (overlay) {
      await user.click(overlay)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })
})
