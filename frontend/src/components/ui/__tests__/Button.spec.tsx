import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '../Button'

describe('Button', () => {
  it('deve renderizar o texto do children', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument()
  })

  it('deve desabilitar o botão quando disabled=true', () => {
    render(<Button disabled>Botão</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('deve ter classes da variante primary por padrão', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button').className).toContain('bg-blue-600')
  })

  it('deve ter classes da variante secondary', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button').className).toContain('bg-gray-200')
  })

  it('deve ter classes da variante danger', () => {
    render(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button').className).toContain('bg-red-600')
  })

  it('deve exibir "Carregando..." quando loading=true', () => {
    render(<Button loading>Enviar</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Carregando...')
  })

  it('deve desabilitar o botão quando loading=true', () => {
    render(<Button loading>Enviar</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
