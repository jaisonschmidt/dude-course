import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { AuthProvider, useAuth } from '../use-auth'

// Mock auth-service
vi.mock('@/services/auth-service', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getStoredToken: vi.fn(() => null),
}))

import * as authService from '@/services/auth-service'

function TestConsumer() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.name : 'null'}</span>
      <button onClick={() => login('test@test.com', 'password123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('deve iniciar com isAuthenticated=false quando não há token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
  })

  it('deve atualizar estado após login bem-sucedido', async () => {
    const mockLoginResponse = {
      accessToken: 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })) + '.sig',
      expiresIn: '1h',
      user: { id: 1, name: 'João', email: 'joao@test.com', role: 'learner' },
    }
    vi.mocked(authService.login).mockResolvedValueOnce(mockLoginResponse)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('João')
    })
  })

  it('deve limpar estado após logout', async () => {
    const mockLoginResponse = {
      accessToken: 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })) + '.sig',
      expiresIn: '1h',
      user: { id: 1, name: 'João', email: 'joao@test.com', role: 'learner' },
    }
    vi.mocked(authService.login).mockResolvedValueOnce(mockLoginResponse)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    await user.click(screen.getByRole('button', { name: /logout/i }))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })
    expect(authService.logout).toHaveBeenCalled()
  })

  it('deve rehydratar do localStorage quando há token válido', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const token = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ exp: futureExp })) + '.sig'
    const storedUser = { id: 1, name: 'Maria', email: 'maria@test.com', role: 'learner' }

    vi.mocked(authService.getStoredToken).mockReturnValue(token)
    localStorage.setItem('auth_user', JSON.stringify(storedUser))

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('user')).toHaveTextContent('Maria')
  })

  it('deve limpar estado quando token expirado é encontrado no localStorage', async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100
    const token = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ exp: pastExp })) + '.sig'

    vi.mocked(authService.getStoredToken).mockReturnValue(token)
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'Expired', email: 'x@x.com', role: 'learner' }))

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(authService.logout).toHaveBeenCalled()
  })

  it('deve lançar erro quando useAuth é usado fora do AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider',
    )

    spy.mockRestore()
  })
})
