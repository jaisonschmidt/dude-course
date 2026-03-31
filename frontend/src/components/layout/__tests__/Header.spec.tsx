import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Header } from '../Header'

const mockUseAuth = vi.fn()
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    })
  })

  it('deve renderizar logo "Dude Course"', () => {
    render(<Header />)
    expect(screen.getByText('Dude Course')).toBeInTheDocument()
  })

  it('deve exibir links públicos (Home, Cursos)', () => {
    render(<Header />)
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Cursos').length).toBeGreaterThanOrEqual(1)
  })

  it('deve exibir Entrar e Criar conta quando não autenticado', () => {
    render(<Header />)
    expect(screen.getAllByText('Entrar').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Criar conta').length).toBeGreaterThanOrEqual(1)
  })

  it('deve exibir nome do usuário e Sair quando autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'João', email: 'joao@test.com', role: 'learner' },
      logout: vi.fn(),
    })

    render(<Header />)
    expect(screen.getAllByText('João').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Sair').length).toBeGreaterThanOrEqual(1)
  })

  it('deve exibir link Dashboard quando autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'João', email: 'joao@test.com', role: 'learner' },
      logout: vi.fn(),
    })

    render(<Header />)
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1)
  })

  it('deve exibir link Admin quando usuário é admin', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
      logout: vi.fn(),
    })

    render(<Header />)
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1)
  })

  it('deve não exibir link Admin quando usuário é learner', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Aluno', email: 'aluno@test.com', role: 'learner' },
      logout: vi.fn(),
    })

    render(<Header />)
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('deve alternar menu mobile ao clicar no hamburger', async () => {
    render(<Header />)
    const user = userEvent.setup()

    const hamburger = screen.getByLabelText('Abrir menu')
    await user.click(hamburger)

    expect(screen.getByLabelText('Menu mobile')).toBeInTheDocument()
  })
})
