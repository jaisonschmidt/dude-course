import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from '../LoginForm'
import { AppError } from '@/services/api'

const mockLogin = vi.fn()
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

describe('LoginForm', () => {
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar campos de email e password', () => {
    render(<LoginForm onSuccess={onSuccess} />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('deve renderizar botão de submit e link para registro', () => {
    render(<LoginForm onSuccess={onSuccess} />)
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByText(/cadastre-se/i)).toHaveAttribute('href', '/register')
  })

  it('deve exibir erro quando email é inválido', async () => {
    render(<LoginForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'invalid')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('deve exibir erro quando password tem menos de 8 caracteres', async () => {
    render(<LoginForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), '1234567')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 8 caracteres')).toBeInTheDocument()
    })
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('deve chamar login com dados válidos e onSuccess após sucesso', async () => {
    mockLogin.mockResolvedValueOnce({ accessToken: 'token', user: { id: 1 } })
    render(<LoginForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', '12345678')
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('deve exibir "Email ou senha inválidos" para erro UNAUTHORIZED', async () => {
    mockLogin.mockRejectedValueOnce(new AppError('UNAUTHORIZED', 'Invalid credentials', 'req-123'))
    render(<LoginForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Email ou senha inválidos')).toBeInTheDocument()
      expect(screen.getByText(/req-123/)).toBeInTheDocument()
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('deve exibir mensagem genérica para erro desconhecido', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'))
    render(<LoginForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Erro inesperado. Tente novamente mais tarde.')).toBeInTheDocument()
    })
  })

  it('deve desabilitar campos durante submissão', async () => {
    let resolveLogin: (value: unknown) => void
    mockLogin.mockReturnValueOnce(new Promise((resolve) => { resolveLogin = resolve }))
    render(<LoginForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeDisabled()
      expect(screen.getByLabelText('Senha')).toBeDisabled()
    })

    resolveLogin!({ accessToken: 'token', user: { id: 1 } })
  })
})
