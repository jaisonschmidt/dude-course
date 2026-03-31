import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterForm } from '../RegisterForm'
import { AppError } from '@/services/api'

const mockRegister = vi.fn()
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}))

describe('RegisterForm', () => {
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar os 4 campos do formulário', () => {
    render(<RegisterForm onSuccess={onSuccess} />)
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument()
  })

  it('deve renderizar botão de submit e link para login', () => {
    render(<RegisterForm onSuccess={onSuccess} />)
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
    expect(screen.getByText(/faça login/i)).toHaveAttribute('href', '/login')
  })

  it('deve exibir erro quando nome tem menos de 2 caracteres', async () => {
    render(<RegisterForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'A')
    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.type(screen.getByLabelText('Confirmar senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('deve exibir erro quando email é inválido', async () => {
    render(<RegisterForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'João')
    await user.type(screen.getByLabelText('Email'), 'invalid')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.type(screen.getByLabelText('Confirmar senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('deve exibir erro quando senhas não conferem', async () => {
    render(<RegisterForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'João')
    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.type(screen.getByLabelText('Confirmar senha'), '87654321')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText('Senhas não conferem')).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('deve chamar register com dados válidos e onSuccess após sucesso', async () => {
    mockRegister.mockResolvedValueOnce(undefined)
    render(<RegisterForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'João')
    await user.type(screen.getByLabelText('Email'), 'joao@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.type(screen.getByLabelText('Confirmar senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('João', 'joao@test.com', '12345678')
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('deve exibir "Email já cadastrado" para erro CONFLICT', async () => {
    mockRegister.mockRejectedValueOnce(new AppError('CONFLICT', 'Email already exists', 'req-456'))
    render(<RegisterForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'João')
    await user.type(screen.getByLabelText('Email'), 'existing@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.type(screen.getByLabelText('Confirmar senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText('Email já cadastrado')).toBeInTheDocument()
      expect(screen.getByText(/req-456/)).toBeInTheDocument()
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('deve desabilitar campos durante submissão', async () => {
    let resolveRegister: (value: unknown) => void
    mockRegister.mockReturnValueOnce(new Promise((resolve) => { resolveRegister = resolve }))
    render(<RegisterForm onSuccess={onSuccess} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'João')
    await user.type(screen.getByLabelText('Email'), 'joao@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.type(screen.getByLabelText('Confirmar senha'), '12345678')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toBeDisabled()
      expect(screen.getByLabelText('Email')).toBeDisabled()
      expect(screen.getByLabelText('Senha')).toBeDisabled()
      expect(screen.getByLabelText('Confirmar senha')).toBeDisabled()
    })

    resolveRegister!(undefined)
  })
})
