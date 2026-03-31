import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProtectedRoute } from '../ProtectedRoute'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockUseAuth = vi.fn()
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve exibir spinner enquanto isLoading=true', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true, user: null })

    render(
      <ProtectedRoute>
        <div>Conteúdo protegido</div>
      </ProtectedRoute>,
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
  })

  it('deve redirecionar para /login quando não autenticado', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null })

    render(
      <ProtectedRoute>
        <div>Conteúdo protegido</div>
      </ProtectedRoute>,
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('deve renderizar children quando autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, name: 'Test', email: 'test@test.com', role: 'learner' },
    })

    render(
      <ProtectedRoute>
        <div>Conteúdo protegido</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('deve redirecionar learner quando requiredRole=admin', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, name: 'Test', email: 'test@test.com', role: 'learner' },
    })

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin only</div>
      </ProtectedRoute>,
    )

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('deve renderizar conteúdo quando admin acessa requiredRole=admin', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
    })

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Admin content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
