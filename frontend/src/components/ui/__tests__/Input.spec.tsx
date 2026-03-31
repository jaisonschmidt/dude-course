import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../Input'

describe('Input', () => {
  it('deve renderizar com label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('deve associar label ao input via htmlFor/id', () => {
    render(<Input label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('deve usar id customizado quando fornecido', () => {
    render(<Input label="Email" id="custom-email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'custom-email')
  })

  it('deve exibir mensagem de erro quando error é fornecido', () => {
    render(<Input label="Email" error="Email inválido" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido')
  })

  it('deve marcar input como aria-invalid quando há erro', () => {
    render(<Input label="Email" error="Obrigatório" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('deve não marcar aria-invalid quando sem erro', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false')
  })

  it('deve aceitar type password', () => {
    render(<Input label="Senha" type="password" />)
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })

  it('deve aplicar classes de erro ao border', () => {
    render(<Input label="Email" error="Inválido" />)
    expect(screen.getByLabelText('Email').className).toContain('border-red-500')
  })

  it('deve encaminhar ref ao input', () => {
    const ref = vi.fn()
    render(<Input label="Test" ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })
})
